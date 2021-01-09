"""Basic utilities to manages shape objects and determine target
location."""

__author__ = "Alex Witt, Bradley Bridges, and Shrivu Shankar"

import io
import math
import time
from typing import Tuple

from hawk_eye.inference import types

from messages import interop_pb2

EARTH_RADIUS = 6378137
EARTH_ECCEN = 0.0818191


def curr_time() -> int:
    """Return the current time in ms."""
    return int(time.perf_counter() * 1000)


def get_odlc(image, image_telem, target) -> interop_pb2.Odlc:
    """Convert a target into a odlc message."""
    odlc = interop_pb2.Odlc()

    odlc.type = interop_pb2.Odlc.STANDARD
    odlc.pos.lat, odlc.pos.lon = _get_lat_lon(image, image_telem, target)
    odlc.orientation = _convert_orientation(image_telem, target.orientation)
    odlc.shape = _convert_shape(target.shape)
    odlc.background_color = _convert_color(target.background_color)
    odlc.alphanumeric = target.alphanumeric
    odlc.alphanumeric_color = _convert_color(target.alphanumeric_color)
    odlc.autonomous = True
    odlc.image = _image_to_bytes(target.image)

    return odlc


def _get_lat_lon(image, image_telem, target) -> Tuple[float, float]:
    """Return the lat and lon of a target from the original image."""
    # If we don't have any telemetry, then just return 0, 0.
    if not image_telem:
        return 0.0, 0.0

    fov = _get_fov(image)

    # Can only continue when having the FOV, so just return the plane
    # position.
    if not fov:
        return image_telem.lat, image_telem.lon

    # Getting the roll and pitch of where the target is in relation
    # to the plane by using the x and y coordinates of the target
    # (where 0, 0 is the top-left). A target at the top of the image
    # adds a pitch of (h/w)fov/2, and a target at the left of the
    # image adds a roll of fov/2. Note that fov is the horizontal fov
    # of the image.
    x = target.x + target.width / 2
    y = target.y + target.height / 2
    w = image.width
    h = image.height
    lat = image_telem.lat
    lon = image_telem.lon
    alt = image_telem.alt
    yaw = image_telem.yaw * math.pi / 180
    pitch = image_telem.pitch + fov / w * (h / 2 - y)
    roll = image_telem.roll + fov / w * (w / 2 - x)

    # If the target appears to be in the air, or too heavy of an
    # angle, return back the plane position since this is unexpected
    # behavior.
    if abs(pitch) >= 2 * math.pi / 3 or abs(roll) >= 2 * math.pi / 3:
        return lat, lon

    # Getting the distance in meters east and north.
    dist_x = alt * (
        math.tan(pitch) * math.sin(yaw)
        - math.tan(roll) / math.cos(pitch) * math.sin(yaw)
    )
    dist_y = alt * (
        math.tan(pitch) * math.cos(yaw)
        + math.tan(roll) / math.cos(pitch) * math.sin(yaw)
    )

    # Convert this to a new lat, lon pair.
    e_radii = _get_earth_radii(lat)
    new_lat = dist_y / e_radii[0] / math.pi * 180 + lat
    new_lon = dist_x / e_radii[1] / math.cos(lat * math.pi / 180) + lon

    return new_lat, new_lon


def _get_fov(pillow_image) -> float:
    """Get the horizontal FOV of an image in radians."""
    exif_data = pillow_image.getexif()
    # 41989 is for 'FocalLengthIn35mmFilm'.
    focal_length = exif_data[41989]

    # FOV calculation, note 36 is the horizontal frame size for 35mm
    # film.
    return 2 * math.atan2(36, 2 * focal_length)


def _get_earth_radii(lat) -> Tuple[float, float]:
    """Earth radii north/south and east/west."""
    r_1 = (
        EARTH_RADIUS
        * (1 - EARTH_ECCEN ** 2)
        / (1 - EARTH_ECCEN ** 2 * math.sin(lat * math.pi / 180) ** 2) ** (3 / 2)
    )
    r_2 = EARTH_RADIUS / math.sqrt(
        1 - EARTH_ECCEN ** 2 * math.sin(lat * math.pi / 180) ** 2
    )

    return r_1, r_2


def _convert_orientation(image_telem, orientation):
    """Convert a numeric orientation to the protobuf orientation."""
    if image_telem:
        value = orientation + image_telem.yaw
    else:
        value = orientation

    directions = [
        interop_pb2.Odlc.NORTH,
        interop_pb2.Odlc.NORTHEAST,
        interop_pb2.Odlc.EAST,
        interop_pb2.Odlc.SOUTHEAST,
        interop_pb2.Odlc.SOUTH,
        interop_pb2.Odlc.SOUTHWEST,
        interop_pb2.Odlc.WEST,
        interop_pb2.Odlc.NORTHWEST,
    ]
    return directions[round(value / 45) % 8]


def _convert_shape(shape):
    """Convert a target_finder shape to a protobuf one."""
    if shape == types.Shape.NAS:
        return interop_pb2.Odlc.UNKNOWN_SHAPE

    return getattr(interop_pb2.Odlc, shape.name.upper())


def _convert_color(color):
    """Convert a target_finder color to a protobuf one."""
    if color == types.Color.NONE:
        return interop_pb2.Odlc.UNKNOWN_COLOR

    return getattr(interop_pb2.Odlc, color.name.upper())


def _image_to_bytes(image):
    """Convert a Pillow image to bytes."""
    if image is None:
        return b""

    buffer = io.BytesIO()
    image.save(buffer, format="JPEG")

    return buffer.getvalue()
