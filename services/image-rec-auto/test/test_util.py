__author__ = "Alex Witt"

import pathlib

from hawk_eye.inference import types
from PIL import Image

from messages import telemetry_pb2
from messages import interop_pb2
from service import util

FIELD_FIXTURE = pathlib.Path(__file__) / "../fixtures/field.jpg"
TARGET_FIXTURE = pathlib.Path(__file__) / "../fixtures/target.jpg"


def test_get_odlc_no_telem() -> None:
    image_telem = None
    image = Image.open(FIELD_FIXTURE)
    target = types.Target(
        x=55,
        y=20,
        width=50,
        height=50,
        shape=types.Shape.CIRCLE,
        orientation=44.0,
        background_color=types.Color.BLUE,
        alphanumeric="A",
        alphanumeric_color=types.Color.ORANGE,
        image=Image.open(TARGET_FIXTURE),
    )

    odlc = util.get_odlc(image, image_telem, target)

    assert odlc.type == interop_pb2.Odlc.STANDARD
    assert odlc.pos.lat == 0.0
    assert odlc.pos.lon == 0.0
    assert odlc.orientation == interop_pb2.Odlc.NORTHEAST
    assert odlc.shape == interop_pb2.Odlc.CIRCLE
    assert odlc.background_color == interop_pb2.Odlc.BLUE
    assert odlc.alphanumeric == "A"
    assert odlc.alphanumeric_color == interop_pb2.Odlc.ORANGE
    assert odlc.autonomous is True
    assert odlc.image


def test_get_odlc_with_yaw() -> None:
    image_telem = telemetry_pb2.CameraTelem()
    image_telem.lat = 30.0
    image_telem.lon = -60.0
    image_telem.alt = 100.0
    image_telem.yaw = 90.0
    image_telem.pitch = 0.0
    image_telem.pitch = 0.0

    image = Image.open(FIELD_FIXTURE)
    target = types.Target(
        x=55,
        y=20,
        width=50,
        height=50,
        shape=types.Shape.CIRCLE,
        orientation=44.0,
        background_color=types.Color.BLUE,
        alphanumeric="A",
        alphanumeric_color=types.Color.ORANGE,
        image=Image.open(TARGET_FIXTURE),
    )

    odlc = util.get_odlc(image, image_telem, target)

    assert odlc.type == interop_pb2.Odlc.STANDARD
    # The camera here is level and the target is in the center of the image, so the lat,
    # lon should just be the same from the telemetry.
    assert odlc.pos.lat == 30.0
    assert odlc.pos.lon == -60.0
    assert odlc.orientation == interop_pb2.Odlc.SOUTHEAST
    assert odlc.shape == interop_pb2.Odlc.CIRCLE
    assert odlc.background_color == interop_pb2.Odlc.BLUE
    assert odlc.alphanumeric == "A"
    assert odlc.alphanumeric_color == interop_pb2.Odlc.ORANGE
    assert odlc.autonomous is True
    assert odlc.image
