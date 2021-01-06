"""Basic test to ensure service functionality."""

__author__ = "Kevin Li and Alex Witt"

import io
from unittest import mock

from hawk_eye.inference import types
from PIL import Image

from messages import imagery_pb2
from service import Service
from . import test_util


def test_target_rec():
    def mock_queue(image_id, _image_proto, _image, targets):
        assert image_id == 0
        assert len(targets) == 1

        target = targets[0]
        assert target is not None
        assert target.shape == types.Shape.TRAPEZOID
        assert target.background_color == types.Color.NONE
        assert target.alphanumeric == ""
        assert target.alphanumeric_color == types.Color.NONE
        assert 215.0 <= target.x <= 230.0
        assert 265.0 <= target.y <= 300.0
        assert 68.0 <= target.width <= 72.5
        assert 70.0 <= target.height <= 75.0
        assert 0.0 <= target.orientation <= 36.0
        assert 0.0 <= target.confidence <= 1.0


    with mock.patch("service.Service._get_next_id") as task_1, mock.patch(
        "service.Service._get_image"
    ) as task_2, mock.patch("service.Service._queue_targets") as task_3, mock.patch(
        "service.Service._finish_processing"
    ) as task_4:

        task_1.return_value = 0

        # Mock an 'image' protobuf message
        image_msg = imagery_pb2.Image()
        byteIO = io.BytesIO()
        field_image = Image.open(test_util.TARGET_FIXTURE)
        field_image.save(byteIO, format="JPEG")
        image_msg.image = byteIO.getvalue()
        # image = Image.open(io.BytesIO(image_msg.image))

        task_2.return_value = image_msg
        task_3.return_value = 1
        task_3.side_effect = mock_queue
        task_4.return_value = 1

        service = Service(
            imagery_host="imagery",
            imagery_port=1234,
            master_host="image-rec-master",
            master_port=1234,
            fetch_interval=1,
        )
        service.run_iter()

        assert task_1.called
        assert task_2.called
        assert task_3.called
        assert task_4.called
