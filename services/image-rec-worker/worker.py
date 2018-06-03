#!/usr/bin/env python

"""Identifies targets as new images come in."""

import base64
from io import BytesIO
import os
import sys
import time
import urllib.parse

import PIL.Image
import requests
import redis
import target_finder
from termcolor import colored


# Putting the messages folder in the python path since the proto
# files depend on each other and this isn't done automatically.
messages_dir = os.path.abspath(os.path.join(__file__, '..', 'messages'))
sys.path.append(messages_dir)


import imagery_pb2


def curr_time():
    """Return the current time in ms."""
    return int(time.time() * 1000)


def get_next_id(redis_client):
    """Get the next unprocessed image id from redis."""
    image_id = None

    # Keep trying to get this from redis until we get an id.
    while image_id == None:
        try:
            # We'll just pop this off the left side of the queue once
            # an id is available.
            image_id = int(redis_client.blpop('unprocessed-images')[1])
        except redis.exceptions.ConnectionError as e:
            print(colored('redis error: ', 'red', attrs=['bold']) + str(e))
            time.sleep(1)

    return image_id


def get_image(imagery_url, image_id):
    """Get the image from the imagery service by id."""
    image = None

    # Keep trying to request from the imagery service until we get
    # the image.
    while image == None:
        try:
            url = 'http://' + imagery_url + '/api/image/' + str(image_id)
            resp = requests.get(url)

            # Parsing the protobuf response.
            image = imagery_pb2.Image()
            image.ParseFromString(resp.content)
        except requests.exceptions.RequestException as e:
            print(colored('requests error: ', 'red', attrs=['bold']) + str(e))
            time.sleep(1)

    return image


def get_lat_lon(image, target):
    """Return the lat and lon of a target from the original image."""
    # TODO - implement
    return 0.0, 0.0


def image_to_base64(image):
    """Convert a Pillow image to base64."""
    buffer = BytesIO()
    image.save(buffer, format='PNG')

    return base64.b64encode(buffer.getvalue())


def parse_targets(image, targets):
    """Convert the targets into odlc tuples which have lat, lon."""
    def convert(target):
        lat, lon = get_lat_lon(image, target)

        return (
            t.orientation, t.shape.name, t.background_color.name,
            t.alphanumeric.name, t.alphanumeric_color.name, lat, lon,
            image_to_base64(t.image) if t.image is not None else ''
        )

    return list(map(convert, targets))


def encode_odlc(odlc, include_image=False):
    """Encode a URL-encoded odlc."""
    return urllib.parse.urlencode(list(zip((
        'orientation', 'shape', 'background_color', 'alphanumeric',
        'alphanumeric_color', 'lat', 'lon', 'image'
    ), map(str, odlc[0:-1] + (odlc[-1] if include_image else '', )))))


def decode_odlc(odlc_qs):
    """Decode a URL-encoded odlc."""
    dict = urllib.parse.parse_qs(odlc_qs)

    # Making the query string into a 8-element tuplc.
    return (
        float(dict['orientation'][0]),
        dict['shape'][0],
        dict['background_color'][0],
        dict['alphanumeric'][0],
        dict['alphanumeric_color'][0],
        float(dict['lat'][0]),
        float(dict['lon'][0]),
        dict['image'][0] if 'image' in dict else ''
    )


def queue_odlcs(redis_client, odlcs):
    """Put the found odlcs in redis so they can be uploaded."""
    # There's nothing to do if we don't have any odlcs.
    if len(odlcs) == 0: return

    # Get the current list of odlcs.
    curr_odlcs = None

    while curr_odlcs == None:
        try:
            # The odlcs are URL-encoded. We'll get the list of ones
            # that have been found so far.
            encoded_targets = redis_client.lrange('odlcs-found', 0, -1)

            # Decode each and that'll give us our odlcs.
            curr_odlcs = map(encoded_targets, decode_odlc)
        except redis.exceptions.ConnectionError as e:
            print(colored('redis error: ', 'red', attrs=['bold']) + str(e))
            time.sleep(1)

    for i in range(0, len(odlcs)):
        odlc = odlcs[i]

        # TODO - check against curr_odlcs first

        odlc_with_image = encode_odlc(odlc, include_image=True)
        odlc = e

        while True:
            try:
                redis_client.pipeline() \
                    .rpush('odlcs-found', odlc) \
                    .rpush('odlcs-to-submit', odlc_with_image) \
                    .execute()
                break
            except redis.exceptions.ConnectionError as e:
                print(colored('redis error: ', 'red', attrs=['bold']) + str(e))
                time.sleep(1)

        print(colored('queued: ', 'green', attrs=['bold']) +
            'target ' + str(i))


def run_iter(imagery_url, redis_client):
    """An interation of all the steps, repeated in main()."""
    image_id = get_next_id(redis_client)

    print(colored('processing: ', 'blue', attrs=['bold']) +
            'image ' + str(image_id))

    t_1 = curr_time()

    # The image retrieved from the imagery service (note that this is
    # a protobuf message object).
    image = get_image(imagery_url, image_id)

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
    # The odlcs are just 8-element tuples.
    odlcs = parse_targets(image, targets)
    queue_odlcs(redis_client, odlcs)


def main():
    # Parsing the imagery URL. If it doesn't exist exist, we'll
    # assume it's on localhost (to make it easier for testing).
    imagery_url = os.environ.get('IMAGERY_URL') or 'localhost:8081'

    # Parsing the redis URL env var. If it doesn't exist we'll just
    # assume we're trying to access a redis server on localhost with
    # the default port.
    redis_url = os.environ.get('REDIS_URL')

    redis_host = 'localhost'
    redis_port = 6379

    if redis_url != None and redis_url != '':
        split = redis_url.split(':')

        if len(split) == 1:
            redis_host = split[0]
        elif len(split) == 2:
            redis_host = split[0]
            redis_port = int(split[1])
        else:
            raise Exception('REDIS_URL should be specified as host:port')

    # Making our redis client. It won't try to connect here yet,
    # however.
    redis_client = redis.StrictRedis(host=redis_host, port=redis_port, db=0)

    # Our main loop.
    while True:
        run_iter(imagery_url, redis_client)


if __name__ == '__main__':
    main()
