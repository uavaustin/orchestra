"""Basic test to ensure service functionality."""

__author__ = "Kevin Li and Alex Witt"

import io
from unittest.mock import patch

from hawk_eye.inference import types
import PIL.Image

from messages.imagery_pb2 import Image
from service import Service
from . import test_util


def test_target_rec():

    def mock_queue(image_id, _image_proto, _image, targets):
        assert image_id == 0
        assert len(targets) == 1

        target = targets[0]
        assert target is not None
        assert target.shape == types.Shape.QUARTER_CIRCLE

    with patch('service.Service._get_next_id') as task_1, \
            patch('service.Service._get_image') as task_2, \
            patch('service.Service._queue_targets') as task_3, \
            patch('service.Service._finish_processing') as task_4:

        task_1.return_value = 0

        # Mock an 'image' protobuf message
        image_msg = Image()
        byteIO = io.BytesIO()
        field_image = PIL.Image.open(test_util.TARGET_FIXTURE)
        field_image.save(byteIO, format='JPEG')
        image_msg.image = byteIO.getvalue()
        #image = PIL.Image.open(io.BytesIO(image_msg.image))

        task_2.return_value = image_msg

        task_3.return_value = 1
        task_3.side_effect = mock_queue

        task_4.return_value = 1

        service = Service(
            imagery_host="imagery",
            imagery_port=1234,
            master_host="image-rec-master",
            master_port=1234,
            fetch_interval=1
        )
        service.run_iter()

        assert task_1.called
        assert task_2.called
        assert task_3.called
        assert task_4.called
