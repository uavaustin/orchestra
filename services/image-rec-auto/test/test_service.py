import io
import pathlib
import PIL.Image
from unittest.mock import patch

from messages.telemetry_pb2 import CameraTelem
from messages.interop_pb2 import Odlc
from messages.imagery_pb2 import Image
from service import Service

FIELD_FIXTURE = pathlib.Path(__file__) / "../fixtures/field.jpg"
TARGET_FIXTURE = pathlib.Path(__file__) / "../fixtures/target.jpg"


def test_sample():
    with patch('service.Service._get_next_id') as task_1, \
            patch('service.Service._get_image') as task_2, \
            patch('service.Service._queue_targets') as task_3, \
            patch('service.Service._finish_processing') as task_4:

        task_1.return_value = 0
        image_msg = Image()
        byteIO = io.BytesIO()
        field_image = PIL.Image.open(TARGET_FIXTURE)
        field_image.save(byteIO, format='PNG')
        image_msg.image = byteIO.getvalue()
        task_2.return_value = image_msg
        task_3.return_value = 1
        task_4.return_value = 1

        service = Service(
            imagery_host="imagery",
            imagery_port=1234,
            master_host="image-rec-master",
            master_port=1234,
            fetch_interval=1
        )
        service.run_iter()
        result = service._queue_targets('huh', 'a', 'b', 'c', 'TARGET')
        print(result)
