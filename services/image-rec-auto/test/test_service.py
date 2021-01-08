"""Basic tests to ensure service functionality."""

__author__ = "Kevin Li and Alex Witt"

import copy
import io
import service
from typing import Optional
import unittest
from unittest import mock

from hawk_eye.inference import types
from PIL import Image

from messages import imagery_pb2
from messages import image_rec_pb2
from . import test_util


class TestBase(unittest.TestCase):
    """Form a class which intializes the shared items across the service tests."""

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
    image_msg = imagery_pb2.Image()
    image_msg.id = image_id
    byteIO = io.BytesIO()
    field_image = Image.open(test_util.TARGET_FIXTURE)
    field_image.save(byteIO, format="JPEG")
    image_msg.image = byteIO.getvalue()

    def _mock_response(
        self,
        status: Optional[int] = 200,
        content: Optional[str] = None,
        headers: Optional[dict] = None,
        ok: Optional[bool] = True
    ) -> mock.Mock:
        """Generalize function to mock the get/post calls in the service."""

        mock_resp = mock.Mock()
        # Set status code and content.
        mock_resp.status_code = status
        mock_resp.content = content

        if headers:
            mock_resp.headers = copy.deepcopy(headers)

        return mock_resp


class TestImageRec(TestBase):

    @mock.patch.object(service.Service, "_get_next_id")
    @mock.patch.object(service.Service, "_get_image")
    @mock.patch.object(service.Service, "_queue_targets")
    @mock.patch.object(service.Service, "_finish_processing")
    def test_target_rec(
        self,
        mock_finish_processing: mock.MagicMock,
        mock_queue_targets: mock.MagicMock,
        mock_get_image: mock.MagicMock,
        mock_get_next_id: mock.MagicMock,
    ) -> None:

        mock_get_next_id.return_value = 0
        mock_get_image.return_value = self.image_msg

        def _queue_side_effect(image_id, _image_proto, _image, targets):
            self.assertEqual(image_id, 0)
            self.assertEqual(len(targets), 1)

            target = targets[0]
            self.assertNotEqual(target, None)
            self.assertEqual(target.shape, types.Shape.TRAPEZOID)
            self.assertEqual(target.background_color, types.Color.NONE)
            self.assertEqual(target.alphanumeric, "")
            self.assertEqual(target.alphanumeric_color, types.Color.NONE)
            self.assertTrue(215 <= target.x <= 230.0)
            self.assertTrue(265.0 <= target.y <= 300.0)
            self.assertTrue(68.0 <= target.width <= 72.5)
            self.assertTrue(70.0 <= target.height <= 75.0)
            self.assertTrue(0.0 <= target.orientation <= 36.0)
            self.assertTrue(0.0 <= target.confidence <= 1.0)

        mock_queue_targets.side_effect = _queue_side_effect
        mock_queue_targets.return_value = True
        mock_finish_processing.return_value = True

        self.auto_service.run_iter()

        self.assertTrue(mock_get_next_id.called)
        self.assertTrue(mock_get_image.called)
        self.assertTrue(mock_queue_targets.called)
        self.assertTrue(mock_finish_processing.called)

    @mock.patch.object(service.Service, "_get_next_id")
    @mock.patch.object(service.Service, "_get_image")
    @mock.patch.object(service.Service, "_queue_targets")
    @mock.patch.object(service.Service, "_finish_processing")
    def test_empty_target_rec(
        self,
        mock_finish_processing: mock.MagicMock,
        mock_queue_targets: mock.MagicMock,
        mock_get_image: mock.MagicMock,
        mock_get_next_id: mock.MagicMock
    ) -> None:

        mock_get_next_id.return_value = 0

        # Empty target image message.
        image_msg = imagery_pb2.Image()
        image_msg.id = 0
        byteIO = io.BytesIO()
        empty_image = Image.open(test_util.FIELD_FIXTURE)
        empty_image.save(byteIO, format="JPEG")
        image_msg.image = byteIO.getvalue()

        mock_get_image.return_value = image_msg
        mock_queue_targets.return_value = False
        mock_finish_processing.return_value = True

        self.auto_service.run_iter()

        self.assertTrue(mock_get_next_id.called)
        self.assertTrue(mock_get_image.called)
        self.assertFalse(mock_queue_targets.called)
        self.assertTrue(mock_finish_processing.called)


class TestGetImage(TestBase):
    image_msg = TestBase.image_msg.SerializeToString()

    @unittest.mock.patch("service.requests.get")
    def test_get_next_id(self, mock_get) -> None:
        mock_resp = self._mock_response(content=self.image_msg)
        mock_get.return_value = mock_resp
        retval = self.auto_service._get_image(0)

        self.assertTrue(mock_get.called)
        self.assertTrue(isinstance(retval, imagery_pb2.Image))
        mock_get.assert_has_calls([mock.call(self.url)])

    @unittest.mock.patch("service.requests.get")
    def test_get_next_id_fail(self, mock_get: mock.MagicMock) -> None:
        # Wrong status
        mock_resp = self._mock_response(status=100, content=self.image_msg)
        mock_get.return_value = mock_resp
        retval = self.auto_service._get_image(0)

        self.assertTrue(mock_get.called)
        self.assertIsNone(retval)
        mock_get.assert_has_calls(
            [
                mock.call(self.url),
                mock.call().raise_for_status(),
                mock.call(self.url),
                mock.call().raise_for_status(),
                mock.call(self.url),
                mock.call().raise_for_status()
            ]
        )


class TestGetNextId(TestBase):

    image_msg = TestBase.image_msg.SerializeToString()

    @unittest.mock.patch("service.requests.post")
    def test_get_next_id(self, mock_post: mock.MagicMock) -> None:
        mock_resp = self._mock_response(content=self.image_msg)
        mock_post.return_value = mock_resp
        retval = self.auto_service._get_next_id()

        self.assertTrue(mock_post.called)
        self.assertEqual(retval, self.image_id)


class TestRunIter(TestBase):

    @mock.patch.object(service.Service, "_get_next_id")
    @mock.patch.object(service.Service, "_get_image")
    def test_run_iter(
        self,
        mock_get_image: mock.MagicMock,
        mock_get_next_id: mock.MagicMock
    ) -> None:
        mock_get_next_id.return_value = self.image_id
        mock_get_image.return_value = self.image_msg

        self.auto_service.run_iter()

        self.assertTrue(mock_get_next_id.called)
        self.assertTrue(mock_get_image.called)


class TestTargetQueue(TestBase):

    mock_target = types.Target(
        x=215,
        y=265,
        width=68,
        height=70,
        shape=types.Shape.TRAPEZOID,
        alphanumeric="K",
        image=TestBase.field_image
    )

    @mock.patch("service.requests.post")
    def test_successful_queue(self, mock_post: mock.MagicMock) -> None:

        mock_resp = self._mock_response(status=201)
        mock_post.return_value = mock_resp

        target_proto = image_rec_pb2.PipelineTarget()
        target_proto.odlc.CopyFrom(
            service.util.get_odlc(self.field_image, None, self.mock_target)
        )
        target_proto.image_id = 0

        retval = self.auto_service._queue_targets(
            0, imagery_pb2.Image(), self.field_image, [self.mock_target]
        )

        self.assertTrue(mock_post.called)
        self.assertTrue(retval)
        self.assertEqual(
            mock_post.call_args_list[0][1].get('data'), target_proto.SerializeToString()
        )

    @mock.patch("service.requests.post")
    def test_repeat_target(self, mock_post: mock.MagicMock) -> None:

        repeat_id = 0
        image_id = 1
        mock_resp = self._mock_response(
            status=303,
            headers={
                "location":
                f"{self.master_host}:{self.master_port}/api/pipeline/images/{repeat_id}"
            }
        )
        mock_post.return_value = mock_resp

        target_proto = image_rec_pb2.PipelineTarget()
        target_proto.odlc.CopyFrom(
            service.util.get_odlc(self.field_image, None, self.mock_target)
        )
        target_proto.image_id = image_id

        retval = self.auto_service._queue_targets(
            image_id, imagery_pb2.Image(), self.field_image, [self.mock_target]
        )

        self.assertTrue(retval)


class TestFinishProcessing(TestBase):

    @mock.patch("service.requests.post")
    def test_successful_procesing(self, mock_post: mock.MagicMock) -> None:

        image_id = 2

        mock_resp = self._mock_response()
        mock_post.return_value = mock_resp
        ret = self.auto_service._finish_processing(image_id)

        url = (
            f"http://{self.master_host}:{self.master_port}"
            + f"/api/pipeline/images/{image_id}/finish-processing-auto"
        )
        self.assertTrue(ret)
        self.assertEqual(mock_post.call_args[0][0], url)
