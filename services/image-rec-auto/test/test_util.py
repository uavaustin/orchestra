import pathlib
import io
import os.path

import PIL.Image
from hawk_eye.inference import types

from messages.telemetry_pb2 import CameraTelem
from messages.interop_pb2 import Odlc

from service.util import get_odlc


FIELD_FIXTURE = pathlib.Path(__file__) / "../fixtures/field.jpg"
TARGET_FIXTURE = pathlib.Path(__file__) / "../fixtures/target.jpg"


def test_get_odlc_no_telem():
    image_telem = None
    image = PIL.Image.open(FIELD_FIXTURE)
    target = types.Target(
        x=55, y=20, width=50, height=50, shape=types.Shape.CIRCLE,
        orientation=44.0, background_color=types.Color.BLUE,
        alphanumeric='A', alphanumeric_color=types.Color.ORANGE,
        image=PIL.Image.open(TARGET_FIXTURE)
    )

    odlc = get_odlc(image, image_telem, target)

    assert odlc.type == Odlc.STANDARD
    assert odlc.pos.lat == 0.0
    assert odlc.pos.lon == 0.0
    assert odlc.orientation == Odlc.NORTHEAST
    assert odlc.shape == Odlc.CIRCLE
    assert odlc.background_color == Odlc.BLUE
    assert odlc.alphanumeric == 'A'
    assert odlc.alphanumeric_color == Odlc.ORANGE
    assert odlc.autonomous is True
    assert odlc.image


def test_get_odlc_with_yaw():
    image_telem = CameraTelem()
    image_telem.lat = 30.0
    image_telem.lon = -60.0
    image_telem.alt = 100.0
    image_telem.yaw = 90.0
    image_telem.pitch = 0.0
    image_telem.pitch = 0.0

    image = PIL.Image.open(FIELD_FIXTURE)
    target = types.Target(
        x=55, y=20, width=50, height=50, shape=types.Shape.CIRCLE,
        orientation=44.0, background_color=types.Color.BLUE,
        alphanumeric='A', alphanumeric_color=types.Color.ORANGE,
        image=PIL.Image.open(TARGET_FIXTURE)
    )

    odlc = get_odlc(image, image_telem, target)

    assert odlc.type == Odlc.STANDARD
    # The camera here is level and the target is in the center of the
    # image, so the lat, lon should just be the same from the
    # telemetry.
    assert odlc.pos.lat == 30.0
    assert odlc.pos.lon == -60.0
    assert odlc.orientation == Odlc.SOUTHEAST
    assert odlc.shape == Odlc.CIRCLE
    assert odlc.background_color == Odlc.BLUE
    assert odlc.alphanumeric == 'A'
    assert odlc.alphanumeric_color == Odlc.ORANGE
    assert odlc.autonomous is True
    assert odlc.image
