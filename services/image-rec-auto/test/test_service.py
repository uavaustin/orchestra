"""Basic test to ensure service functionality."""

__author__ = "Kevin Li and Alex Witt"

import io
from unittest import mock
import unittest

from hawk_eye.inference import types
from PIL import Image

from messages import imagery_pb2
from messages import image_rec_pb2
import service

from . import test_util


class TestBase(unittest.TestCase):
    imagery_host = "imagery"
    imagery_port = 1234
    master_host = "image-rec-master"
    master_port = 1234
    image_id = 0
    url = f"http://{imagery_host}:{imagery_port}/api/image/{image_id}"

    auto_service = service.Service(
        imagery_host=imagery_host,
        imagery_port=imagery_port,
        master_host=master_host,
        master_port=master_port,
        fetch_interval=1,
    )
    image_id = 0
    image_msg = imagery_pb2.Image()
    image_msg.id = image_id
    byteIO = io.BytesIO()
    field_image = Image.open(test_util.TARGET_FIXTURE)
    field_image.save(byteIO, format="JPEG")
    image_msg.image = byteIO.getvalue()

    def _mock_response(
        self,
        status=200,
        content="CONTENT",
        json_data=None,
        raise_for_status=None,
        ok=True
    ) -> mock.Mock:
        mock_resp = mock.Mock()
        # mock raise_for_status call w/optional error
        mock_resp.raise_for_status = mock.Mock()
        if raise_for_status:
            mock_resp.raise_for_status.side_effect = raise_for_status
        # set status code and content
        mock_resp.status_code = status
        mock_resp.content = content
        # add json data if provided
        if json_data:
            mock_resp.json = mock.Mock(return_value=json_data)
        return mock_resp


def test_target_rec():
    def _mock_queue(image_id, _image_proto, _image, targets):
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
        task_3.side_effect = _mock_queue
        task_4.return_value = 1

        auto_service = service.Service(
            imagery_host="imagery",
            imagery_port=1234,
            master_host="image-rec-master",
            master_port=1234,
            fetch_interval=1,
        )
        auto_service.run_iter()

        assert task_1.called
        assert task_2.called
        assert task_3.called
        assert task_4.called


class TestGetImage(TestBase):
    image_msg = TestBase.image_msg.SerializeToString()

    @unittest.mock.patch("service.requests.get")
    def test_get_next_id(self, mock_get):
        mock_resp = self._mock_response(content=self.image_msg)
        mock_get.return_value = mock_resp
        retval = self.auto_service._get_image(0)

        self.assertTrue(mock_get.called)
        self.assertTrue(isinstance(retval, imagery_pb2.Image))
        self.assertEqual(mock_get.call_args.args[0], self.url)

    @unittest.mock.patch("service.requests.get")
    def test_get_next_id_fail(self, mock_get):
        # Wrong status
        mock_resp = self._mock_response(status=100, content=self.image_msg)
        mock_get.return_value = mock_resp
        retval = self.auto_service._get_image(0)

        self.assertTrue(mock_get.called)
        self.assertIsNone(retval)
        self.assertEqual(mock_get.call_args.args[0], self.url)


class TestGetNextId(TestBase):

    image_msg = TestBase.image_msg.SerializeToString()

    @unittest.mock.patch("service.requests.post")
    def test_get_next_id(self, mock_post):
        mock_resp = self._mock_response(content=self.image_msg)
        mock_post.return_value = mock_resp
        retval = self.auto_service._get_next_id()

        self.assertTrue(mock_post.called)
        self.assertTrue(isinstance(retval, int))
        self.assertEqual(retval, self.image_id)


class TestRunIter(TestBase):

    @mock.patch.object(service.Service, "_get_next_id")
    @mock.patch.object(service.Service, "_get_image")
    def test_run_iter(
        self,
        mock_get_next_id,
        mock_get_image,
    ):
        mock_get_next_id.return_value = self.image_id
        mock_get_image.return_value = self.image_msg

        self.auto_service.run_iter()

        self.assertTrue(mock_get_next_id.called)
        self.assertTrue(mock_get_image.called)


class TestTargetQueue(TestBase):

    def _mock_response(
        self,
        status=200,
        content="CONTENT",
        json_data=None,
        raise_for_status=None,
        ok=True
    ) -> mock.Mock:
        mock_resp = mock.Mock()
        # mock raise_for_status call w/optional error
        mock_resp.raise_for_status = mock.Mock()
        if raise_for_status:
            mock_resp.raise_for_status.side_effect = raise_for_status
        # set status code and content
        mock_resp.status_code = status
        mock_resp.content = content
        # add json data if provided
        if json_data:
            mock_resp.json = mock.Mock(return_value=json_data)
        return mock_resp

    @mock.patch("service.requests.post")
    def test_successful_queue(self, mock_post):

        mock_target = types.Target(
            x=215,
            y=265,
            width=68,
            height=70,
            shape=types.Shape.TRAPEZOID,
            alphanumeric="K",
            image=TestBase.field_image
        )
        mock_resp = self._mock_response(status=201)
        mock_post.return_value = mock_resp

        target_proto = image_rec_pb2.PipelineTarget()
        target_proto.odlc.CopyFrom(
            service.util.get_odlc(self.field_image, None, mock_target)
        )
        target_proto.image_id = 0

        retval = self.auto_service._queue_targets(
            0, imagery_pb2.Image(), self.field_image, [mock_target]
        )

        self.assertTrue(mock_post.called)
        self.assertTrue(retval)
        # data is in the second positional argument
        self.assertEqual(
            mock_post.call_args_list[0][1].get('data'), target_proto.SerializeToString()
        )
