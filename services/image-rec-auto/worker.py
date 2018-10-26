#!/usr/bin/env python

"""Identifies targets as new images come in."""

import base64
import json
from io import BytesIO
import os
from math import pi, sin, cos, tan, sqrt
import sys
import time
import urllib.parse

import PIL.Image
import requests
import redis
import target_finder
from termcolor import colored

import interop_pb2
import imagery_pb2


EARTH_RADIUS = 6378137
EARTH_ECCEN  = 0.0818191


def curr_time():
    """Return the current time in ms."""
    return int(time.time() * 1000)


def get_next_id(redis_client):
    """Get the next unprocessed image id from redis."""
    image_id = None

    # Keep trying to get this from redis until we get an id.
    while image_id == None:
        try:
            # We'll just pop this off the right side of the queue
            # once an id is available.
            image_id = int(redis_client.brpoplpush(
                'unprocessed-auto', 'processing-auto'
            )[1])
        except redis.exceptions.ConnectionError as e:
            print(colored('redis error: ', 'red', attrs=['bold']) + str(e))
            time.sleep(1)

    return image_id


def get_image(imagery_url, image_id):
    """Get the image from the imagery service by id.

    Returns None if the status code is not 200.
    """

    image = None

    # Keep trying to request from the imagery service until we get
    # the image.
    while image == None:
        try:
            url = f'{imagery_url}/api/image/{image_id}'
            resp = requests.get(url)

            # We'll just return None with an unexpected status code.
            if resp.status_code != 200:
                break

            # Parsing the protobuf response.
            image = imagery_pb2.Image()
            image.ParseFromString(resp.content)
        except requests.exceptions.RequestException as e:
            print(colored('requests error: ', 'red', attrs=['bold']) + str(e))
            time.sleep(1)

    return image


def get_earth_radii(lat):
    r_1 = (EARTH_RADIUS * (1 - EARTH_ECCEN ** 2) /
           (1 - EARTH_ECCEN ** 2 * sin(lat * pi / 180) ** 2) ** (3 / 2))
    r_2 = EARTH_RADIUS / sqrt(1 - EARTH_ECCEN ** 2 * sin(lat * pi / 180) ** 2)

    return r_1, r_2


def get_lat_lon(image, target):
    """Return the lat and lon of a target from the original image."""
    # If we don't have any telemetry, then just return 0, 0.
    if not image.has_telem:
        return 0.0, 0.0

    lat = image.telem.lat
    lon = image.telem.lon
    alt = image.telem.alt
    yaw = image.telem.yaw * pi / 180

    # Getting the roll and pitch of where the target is in relation
    # to the plane by using the x and y coordinates of the target
    # (where 0, 0 is the top-left). A target at the top of the image
    # adds a pitch of (h/w)fov/2, and a target at the right of the
    # image adds a roll of fov/2. Note that fov is the horizontal fov
    # of the image.

    x = target.x
    y = target.y
    w = target.image.width
    h = target.image.height

    fov = 73.7 * pi / 180
    pitch = -pi / 2 + (fov / w * (h / 2 - y))
    roll = 0 + (fov * (2 * x - w) / w)

    # If the target appears to be in the air, or too heavy of an
    # angle, we'll just return our lat and lon just in case.
    if pitch >= pi / 3 or abs(roll) >= pi / 3:
        return lat, lon

    # Getting the distance in meters east and north.
    dist_x = alt * (tan(roll) / cos(pitch) * cos(yaw) + tan(pitch) * sin(yaw))
    dist_y = alt * (tan(pitch) * cos(yaw) - tan(roll) / cos(pitch) * sin(yaw))

    e_radii = get_earth_radii(lat)

    new_lat = dist_y / e_radii[0] / pi * 180 + lat
    new_lon = dist_x / e_radii[1] / cos(lat * pi / 180) + lon

    return [new_lat, new_lon]


def convert_orientation(orientation):
    """Convert a numeric orientation to the protobuf orientation."""
    if orientation >= 337.5 or orientation < 22.5:
        return interop_pb2.Odlc.NORTH
    elif orientation < 67.5:
        return interop_pb2.Odlc.NORTHEAST
    elif orientation < 112.5:
        return interop_pb2.Odlc.EAST
    elif orientation < 157.5:
        return interop_pb2.Odlc.SOUTHEAST
    elif orientation < 202.5:
        return interop_pb2.Odlc.SOUTH
    elif orientation < 247.5:
        return interop_pb2.Odlc.SOUTHWEST
    elif orientation < 292.5:
        return interop_pb2.Odlc.WEST
    else:
        return interop_pb2.Odlc.NORTHWEST


def convert_shape(shape):
    """ Convert a target_finder shape to a protobuf one."""
    if shape == target_finder.Shape.NAS:
        return interop_pb2.Odlc.UNKNOWN_SHAPE

    return getattr(interop_pb2.Odlc, shape.name.upper())


def convert_color(color):
    """ Convert a target_finder color to a protobuf one."""
    if color == target_finder.Color.NONE:
        return interop_pb2.Odlc.UNKNOWN_COLOR

    return getattr(interop_pb2.Odlc, color.name.upper())


def image_to_bytes(image):
    """Convert a Pillow image to bytes."""
    if image is None:
        return b''

    buffer = BytesIO()
    image.save(buffer, format='JPEG')

    return buffer.getvalue()


def parse_targets(image, targets):
    """Convert the targets into odlc messages."""
    def convert(target):
        odlc = interop_pb2.Odlc()

        odlc.type = interop_pb2.Odlc.STANDARD
        odlc.pos.lat, odlc.pos.lon = get_lat_lon(image, target)
        odlc.orientation = convert_orientation(target.orientation)
        odlc.shape = convert_shape(target.shape)
        odlc.background_color = convert_color(target.background_color)
        odlc.alphanumeric = target.alphanumeric
        odlc.alphanumeric_color = convert_color(target.alphanumeric_color)
        odlc.autonomous = True
        odlc.image = image_to_bytes(target.image)

        return odlc

    return list(map(convert, targets))


def encode_odlc(odlc):
    """Encode a target into the protobuf wire format."""
    return odlc.SerializeToString()


def queue_odlcs(redis_client, image_id, odlcs):
    """Put the found odlcs in redis so they can be uploaded."""

    encoded = map(encode_odlc, odlcs)

    while True:
        try:
            pipeline = redis_client.pipeline()

            pipeline.lrem(image_id)
            pipeline.lpush('processed-auto', image_id)

            if len(encoded) > 0:
                pipeline.lpush('found-auto', *encoded)

            pipeline.execute()

            for i in range(0, len(odlcs)):
                print(colored('queued: ', 'green', attrs=['bold']) +
                    'target ' + str(i))

            break
        except redis.exceptions.ConnectionError as e:
            print(colored('redis error: ', 'red', attrs=['bold']) + str(e))
            time.sleep(1)


def run_iter(imagery_url, redis_client):
    """An interation of all the steps, repeated in main()."""
    image_id = get_next_id(redis_client)

    print(colored('processing: ', 'blue', attrs=['bold']) +
            'image ' + str(image_id))

    t_1 = curr_time()

    # The image retrieved from the imagery service (note that this is
    # a protobuf message object).
    image = get_image(imagery_url, image_id)

    if image is None:
        print(' --> ' + colored(
            'imagery service gave non-200 status code, skipping image',
            'red', attrs=['bold']
        ))
        return

    # Converting the image to a Pillow one
    pillow_image = PIL.Image.open(BytesIO(image.image))

    t_2 = curr_time()

    print(' --> retreived image in {:d} ms'.format(t_2 - t_1))

    # Getting the list of blobs.
    blobs = target_finder.find_blobs(pillow_image, limit=20)

    t_3 = curr_time()

    print(' --> {:d} blobs found in {:d} ms'.format(len(blobs), t_3 - t_2))

    # Getting targets in our set of blobs (if there are any).
    targets = target_finder.find_targets(blobs=blobs)

    t_4 = curr_time()

    if len(blobs) > 0:
        print(' --> {:d} targets found in {:d} ms'.format(len(targets),
                                                          t_4 - t_3))

    # Making these targets into "odlcs", where an odlc has a lat/lon
    # instead of just x, y position and width, height. Then we'll
    # submit the ones we have (or do nothing if we don't have any).
    odlcs = parse_targets(image, targets)
    queue_odlcs(redis_client, image_id, odlcs)

    t_5 = curr_time()

    print(' --> sent results in {:d} ms'.format(t_5 - t_4))


def main():
    imagery_host = os.environ.get('IMAGERY_HOST')
    imagery_port = os.environ.get('IMAGERY_PORT')
    imagery_url = f'http://{imagery_host}:{imagery_port}'

    redis_host = os.environ.get('REDIS_HOST')
    redis_port = os.environ.get('REDIS_PORT')

    # Making our redis client. It won't try to connect here yet,
    # however.
    redis_client = redis.StrictRedis(host=redis_host, port=redis_port, db=0)

    # Our main loop.
    while True:
        run_iter(imagery_url, redis_client)


if __name__ == '__main__':
    main()
