import io
import pathlib
import PIL.Image

from messages.telemetry_pb2 import CameraTelem
from messages.interop_pb2 import Odlc
from service import Service

FIELD_FIXTURE = pathlib.Path(__file__) / "../fixtures/field.jpg"
TARGET_FIXTURE = pathlib.Path(__file__) / "../fixtures/target.jpg"


def test_sample():
    service = Service(
        imagery_host="imagery",
        imagery_port=1234,
        master_host="image-rec-master",
        master_port=1234,
        fetch_interval=1
    )
