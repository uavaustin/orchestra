"""Identifies targets as new images come in."""

import io
import logging
import time

import inflect
import PIL.Image
import requests
from hawk_eye.inference import find_targets

from common.logger import format_error
from messages.image_rec_pb2 import PipelineImage, PipelineTarget
from messages.imagery_pb2 import Image

from .util import curr_time, get_odlc


# Used for printing in Service._queue_targets().
p = inflect.engine()


class Service:
    def __init__(self, imagery_host, imagery_port, master_host, master_port,
                 fetch_interval):
        """Create a new image-rec-auto service."""
        self._imagery_url = f'http://{imagery_host}:{imagery_port}'
        self._master_url = f'http://{master_host}:{master_port}'
        self._fetch_interval = fetch_interval
        self.clf_model, self.det_model = find_targets.load_models()

    def run_iter(self):
        """A single interation of all the steps."""
        image_id = self._get_next_id()

        logging.info(f'processing image {image_id}')

        t_1 = curr_time()

        # The image retrieved from the imagery service (note that
        # this is a protobuf message object).
        image_proto = self._get_image(image_id)

        if not image_proto:
            logging.error('imagery service did not give image, skipping')
            return

        # Converting the image to a Pillow one.
        image = PIL.Image.open(io.BytesIO(image_proto.image))

        t_2 = curr_time()
        logging.info('retreived image in {:d} ms'.format(t_2 - t_1))

        # Getting targets in our set of blobs (if there are any).
        targets = find_targets.find_targets(image, self.clf_model, self.det_model)

        t_3 = curr_time()
        logging.info('{:d} targets found in {:d} ms'.format(len(targets),
                                                            t_3 - t_2))

        if targets:
            ret = self._queue_targets(image_id, image_proto, image, targets)

            t_4 = curr_time()

            if ret:
                logging.info('queued targets in {:d} ms'.format(t_4 - t_3))
            else:
                logging.error('failed to upload targets')

        ret = self._finish_processing(image_id)

        if ret:
            logging.info(f'finished processing image {image_id}')
        else:
            logging.error(f'could not mark image {image_id} as finished')

    def _get_next_id(self):
        """Get the next unprocessed image id from redis."""
        url = f'{self._master_url}/api/pipeline/images/' + \
            'start-processing-next-auto'

        # Keep trying until it's successful.
        while True:
            try:
                resp = requests.post(url)

                if resp.status_code == 200:
                    # Extract the id from the response.
                    return PipelineImage.FromString(resp.content).id
                elif resp.ok:
                    logging.warn('unexpected successful status code '
                                 f'{resp.status_code} when getting next image')
                # It'll be 409 if no image is available, handle this
                # silently without showing an exception.
                elif resp.status_code != 409 and not resp.ok:
                    resp.raise_for_status()
            except requests.RequestException as e:
                logging.error(format_error('request error', str(e)))

            # Sleep a little when we get 409 or any other error.
            time.sleep(self._fetch_interval / 1000)

    def _get_image(self, image_id):
        """Get the image from the imagery service by id.

        Returns None if the status code is not 200 or if the request
        fails for other reasons after 3 tries.
        """
        url = f'{self._imagery_url}/api/image/{image_id}'

        # We'll give it 3 tries, otherwise, return None. The pipeline
        # will requeue this image after the first failure, so it's
        # okay to stop trying.
        for _ in range(3):
            try:
                resp = requests.get(url)

                if resp.status_code == 200:
                    return Image.FromString(resp.content)
                else:
                    resp.raise_for_status()
            except requests.RequestException as e:
                logging.error(format_error('request error', str(e)))

            # Sleep a little for the next try.
            time.sleep(self._fetch_interval / 1000)
        else:
            return None

    def _queue_targets(self, image_id, image_proto, image, targets):
        """Queue the target in the image rec pipeline.

        Returns if the operation was succesful.
        """
        url = f'{self._master_url}/api/pipeline/targets'

        for target_num, target in enumerate(targets, start=1):
            image_telem = image_proto.telem if image_proto.has_telem else None

            target_proto = PipelineTarget()
            target_proto.odlc.CopyFrom(get_odlc(image, image_telem, target))
            target_proto.image_id = image_id

            data = target_proto.SerializeToString()

            # Give each 3 tries.
            for _ in range(3):
                try:
                    resp = requests.post(url, data=data, headers={
                        'content-type': 'application/x-protobuf'
                    }, allow_redirects=False)
                    resp.raise_for_status()

                    if resp.status_code == 303:
                        similar = 'target ' + \
                            resp.headers.get('location').split('/')[-1]

                        # If there's more than one target, specify
                        # which, otherwise, just say 'target'.
                        if len(targets) > 1:
                            # Equal to 'first', 'second', etc.
                            order = p.number_to_words(p.ordinal(target_num))
                            target_name = f'{order} target'
                        else:
                            target_name = 'target'

                        logging.warn(f'{target_name} was similar to {similar}')
                except requests.RequestException as e:
                    logging.error(format_error('request error', str(e)))
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

    def _finish_processing(self, image_id):
        """End the processing window for an image.

        Returns if the operation was succesful.
        """
        url = f'{self._master_url}/api/pipeline/images/' + \
            f'{image_id}/finish-processing-auto'

        # Give it 3 tries.
        for _ in range(3):
            try:
                resp = requests.post(url)

                if resp.status_code == 200:
                    return True
                else:
                    resp.raise_for_status()
            except requests.RequestException as e:
                logging.error(format_error('request error', str(e)))

            # Sleep a little for the next try.
            time.sleep(self._fetch_interval / 1000)
        else:
            return False
