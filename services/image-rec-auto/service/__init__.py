"""Identifies targets as new images come in."""

__author__ = "Alex Witt, Kevin Li, Bradley Bridges, Shrivu Shankar"

import inflect
import io
import logging
import requests
import time
from typing import List

from PIL import Image
from hawk_eye.inference import find_targets, types

from common import logger
from messages import image_rec_pb2
from messages import imagery_pb2
from . import util

# Used for printing in Service._queue_targets().
p = inflect.engine()


class Service:
    def __init__(
        self,
        imagery_host: str,
        imagery_port: str,
        master_host: str,
        master_port: str,
        fetch_interval: int,
    ) -> None:
        """Create a new image-rec-auto service."""
        self._imagery_url = f"http://{imagery_host}:{imagery_port}"
        self._master_url = f"http://{master_host}:{master_port}"
        self._fetch_interval = fetch_interval
        self.clf_model, self.det_model = find_targets.load_models()

    def run_iter(self) -> None:
        """A single interation of all the steps."""
        image_id = self._get_next_id()

        logging.info(f"processing image {image_id}")

        t_1 = util.curr_time()

        # The image retrieved from the imagery service (note that
        # this is a protobuf message object).
        image_proto = self._get_image(image_id)

        if not image_proto:
            logging.error("imagery service did not give image, skipping")
            return

        # Converting the image to a Pillow one.
        image = Image.open(io.BytesIO(image_proto.image))

        t_2 = util.curr_time()
        logging.info(f"retreived image in {t_2 - t_1:d} ms")

        # Getting targets in our set of blobs (if there are any).
        targets, _ = find_targets.find_targets(image, self.clf_model, self.det_model)

        t_3 = util.curr_time()
        logging.info(f"{len(targets)} targets found in {t_3 - t_2:d} ms")

        if targets and len(targets) > 0:
            ret = self._queue_targets(image_id, image_proto, image, targets)
            t_4 = util.curr_time()

            if ret:
                logging.info(f"queued targets in {t_4 - t_3:d} ms")
            else:
                logging.error("failed to upload targets")

        ret = self._finish_processing(image_id)

        if ret:
            logging.info(f"finished processing image {image_id}")
        else:
            logging.error(f"could not mark image {image_id} as finished")

    def _get_next_id(self) -> int:
        """Get the next unprocessed image id from redis."""
        url = f"{self._master_url}/api/pipeline/images/start-processing-next-auto"

        # Keep trying until it's successful.
        while True:
            try:
                resp = requests.post(url)

                if resp.status_code == 200:
                    # Extract the id from the response.
                    return image_rec_pb2.PipelineImage.FromString(resp.content).id
                elif resp.ok:
                    logging.warning(
                        "unexpected successful status code "
                        f"{resp.status_code} when getting next image"
                    )
                # It'll be 409 if no image is available, handle this
                # silently without showing an exception.
                elif resp.status_code != 409 and not resp.ok:
                    resp.raise_for_status()
            except requests.RequestException as e:
                logging.error(logger.format_error("request error", str(e)))

            # Sleep a little when we get 409 or any other error.
            time.sleep(self._fetch_interval / 1000)

    def _get_image(self, image_id: int) -> imagery_pb2.Image:
        """
        Get the image from the imagery service by id.

        Returns None if the status code is not 200 or if the request
        fails for other reasons after 3 tries. Returns a image_rec::Image
        protobuf message if successful.
        """
        url = f"{self._imagery_url}/api/image/{image_id}"

        # We'll give it 3 tries, otherwise, return None. The pipeline
        # will requeue this image after the first failure, so it's
        # okay to stop trying.
        for _ in range(3):
            try:
                resp = requests.get(url)

                if resp.status_code == 200:

                    return imagery_pb2.Image.FromString(resp.content)
                else:
                    resp.raise_for_status()
            except requests.RequestException as e:
                logging.error(logger.format_error("request error", str(e)))

            # Sleep a little for the next try.
            time.sleep(self._fetch_interval / 1000)
        else:
            return None

    def _queue_targets(
        self,
        image_id: int,
        image_proto: imagery_pb2.Image,
        image: Image,
        targets: List[types.Target],
    ) -> bool:
        """
        Queue the target in the image rec pipeline.

        Returns if the operation was succesful.
        """
        url = f"{self._master_url}/api/pipeline/targets"

        for target_num, target in enumerate(targets, start=1):
            image_telem = image_proto.telem if image_proto.has_telem else None

            target_proto = image_rec_pb2.PipelineTarget()
            target_proto.odlc.CopyFrom(util.get_odlc(image, image_telem, target))
            target_proto.image_id = image_id

            data = target_proto.SerializeToString()

            # Give each 3 tries.
            for _ in range(3):
                try:
                    resp = requests.post(
                        url,
                        data=data,
                        headers={"content-type": "application/x-protobuf"},
                        allow_redirects=False,
                    )
                    resp.raise_for_status()

                    if resp.status_code == 303:
                        similar = (
                            "target " + resp.headers.get("location").split("/")[-1]
                        )

                        # If there's more than one target, specify which, otherwise,
                        # just say 'target'.
                        if len(targets) > 1:
                            # Equal to 'first', 'second', etc.
                            order = p.number_to_words(p.ordinal(target_num))
                            target_name = f"{order} target"
                        else:
                            target_name = "target"

                        logging.warning(f"{target_name} was similar to {similar}")
                except requests.RequestException as e:
                    logging.error(logger.format_error("request error", str(e)))
                else:
                    break

                # Sleep a little for the next try.
                time.sleep(self._fetch_interval / 1000)
            else:
                # Don't continue if a target fails to be queued.
                return False
        else:
            # All succeeded.
            return True

    def _finish_processing(self, image_id: int) -> bool:
        """
        End the processing window for an image.

        Returns if the operation was succesful.
        """
        url = (
            f"{self._master_url}/api/pipeline/images/"
            + f"{image_id}/finish-processing-auto"
        )

        # Give it 3 tries.
        for _ in range(3):
            try:
                resp = requests.post(url)

                if resp.status_code == 200:
                    return True
                else:
                    resp.raise_for_status()
            except requests.RequestException as e:
                logging.error(logger.format_error("request error", str(e)))

            # Sleep a little for the next try.
            time.sleep(self._fetch_interval / 1000)
        else:
            return False
