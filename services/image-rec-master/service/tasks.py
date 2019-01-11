"""Contains recurring pipeline tasks.

Tasks move images and targets through the beginning and ending parts
of the image recognition pipelines, with auto and manual image rec
do the "middle parts".

There are two distict pipelines at play: images and targets.

This module contains tasks for the queueing / re-queueing of images,
and the submission and removal of targets.

Image pipeline:
    New images are checked for on an interval and placed into
    'all-images'. New Images that do not need to be checked are
    placed into 'skipped-auto' and 'skipped-manual' for auto and
    manual image rec. Otherwise, new images are placed into
    'unprocessed-auto' and 'unprocessed-manual'.

    Auto workers take images from 'unprocessed-auto' and place them
    in 'processing-auto'. Upon successful processing, they are moved
    into 'processed-auto' (and at the same time a target is placed
    in the target pipeline if necessary). If the auto worker errors
    during processing, the image will remain in 'processing-auto'. A
    task watches 'processing-auto' to determine if images have
    stalled. If they have, they are placed into 'retrying-auto' and
    are also placed in 'unprocessed-auto' if they are not already in
    'retrying-auto' or 'errored-auto'. Otherwise, if they are already
    in 'retrying-auto' (thus have failed processing before), they are
    placed into 'errored-auto' and removed from 'retrying-auto'.

    Manual workers take images from 'unprocessed-manual' and move
    them into 'processed-manual' directly. Manual workers may also
    move images from 'skipped-manual' to 'processed-manual'.

Target pipeline:
    Unique targets are placed into 'all-targets' and
    'unsubmitted-targets'. Uniqueness is checked by auto workers by
    viewing all targets submitted at that point while uniqueness is
    not checked for manual targets.

    Targets from 'unsubmitted-targets' are moved into
    'submitting-targets' to indicate that they are being submitted.
    Upon successful submission, they are moved into
    'submitted-targets'. Otherwise, on submission failure, they are
    placed into 'errored-targets'. Submission failures are not do
    to API unavailability, but instead invalid submission data
    (`400`s).

    Targets may also be removed. Removal requests are placed into
    'unremoved-targets', i.e. they are not removed yet. Targets from
    'unremoved-targets' are moved into 'removing-targets' to indicate
    that they are being removed. If the target is in
    'unsubmitted-targets', it is moved directly into
    'removed-targets'. If the target does not exist on the interop
    server, it is ignored. Otherwise, upon successful removal, it is
    placed into 'removed-targets'. Removed targets that were
    submitted remain in 'submitted-targets'. There is no error
    condition for removal.

Note that are both Redis lists and sets involved. Lists are used
for items that worker tasks pop elements directly off of, while sets
are used for reading on demand.
"""

import asyncio
import contextlib
import logging

import aiohttp
import aioredis

from common.logger import format_error
from messages.imagery_pb2 import AvailableImages
from messages.interop_pb2 import Odlc

from .util import get_int_list, get_int_set


async def start_tasks(app):
    # For checking for errored auto workers.
    app['prev_processing_auto'] = []

    tasks = []
    tasks.append(_create_task(app, _queue_new_images, 0.5))
    tasks.append(_create_task(app, _requeue_auto_images, 15.0))
    tasks.append(_create_task(app, _submit_targets, 0.0))
    tasks.append(_create_task(app, _remove_targets, 0.0))

    app['tasks'] = tasks


async def stop_tasks(app):
    for task in app['tasks']:
        task.cancel()


def _create_task(app, coro, interval):
    async def wrapped(app):
        while True:
            try:
                await coro(app)
                await asyncio.sleep(interval)
            except aioredis.MultiExecError:
                # Another instance updated the watched keys before a
                # transaction could complete. Short timeout.
                await asyncio.sleep(0.1)
            except aioredis.RedisError as e:
                logging.error(format_error('redis error', str(e)))
                await asyncio.sleep(0.5)
            except asyncio.CancelledError as e:
                raise e
            except Exception as e:
                logging.exception(format_error('unexpected error',
                                               'exception in task'))
                await asyncio.sleep(0.5)

    return app.loop.create_task(wrapped(app))


# Queue new images into the all-images, unprocessed-auto, and
# unprocessed-manual queues. (skipping not implemented).
async def _queue_new_images(app):
    try:
        url = app['imagery_url'] + '/api/available'
        msg = AvailableImages()

        # Request the available images from the imagery service.
        async with app['http_client'].get(url) as resp:
            resp.raise_for_status()

            content = await resp.read()
            msg.ParseFromString(content)

        available = msg.id_list
    except aiohttp.ClientError as e:
        # Handle the possible HTTP error above.
        logging.error(format_error('http error', str(e)))
    else:
        # Otherwise, if there are new images, push them.
        async with _watch_keys(app, 'all-images') as r:
            all_ids = await get_int_set(r, 'all-images')
            ids = sorted(set(available) - set(all_ids))

            if len(ids) > 0:
                tr = r.multi_exec()
                tr.sadd('all-images', *ids)
                tr.lpush('unprocessed-auto', *ids)
                tr.lpush('unprocessed-manual', *ids)

                if len(ids) == 1:
                    logging.info(f'image {ids[0]} queued')
                else:
                    images = ', '.join(str(i) for i in ids)
                    logging.info(f'images {images} queued')

                await tr.execute()


# Place an errored auto image back into the auto queue when it errors
# for the first time, otherwise on the second time marked it as
# permanently errored. Runs on a slow 15s interval.
async def _requeue_auto_images(app):
    async with _watch_keys(app, 'processing-auto') as r:
        processing = await get_int_list(r, 'processing-auto')
        prev = app['prev_processing_auto']
        stale_ids = sorted(set(processing).intersection(set(prev)))

        if len(stale_ids) > 0:
            retrying = await get_int_set(r, 'retrying-auto')
            errored = await get_int_set(r, 'erorred-auto')
            tr = r.multi_exec()

            for image_id in stale_ids:
                tr.lrem('processing-auto', 0, image_id)

                if image_id not in retrying and image_id not in errored:
                    tr.sadd('retrying-auto', image_id)
                    tr.rpush('unprocessed-auto', image_id)
                    logging.info(f'image {image_id} requeued')
                elif image_id in retrying:
                    tr.srem('retrying-auto', image_id)
                    tr.sadd('errored-auto', image_id)
                    logging.info(f'image {image_id} errored twice')

            await tr.execute()

        app['prev_processing_auto'] = processing


# Send new targets to interop-proxy as they come in. If the targets
# are in the removal process then cancel. This process will keep
# trying until the target is submitted.
async def _submit_targets(app):
    # Acquire a connection to prevent blocking other tasks and get
    # the next target id when it comes up.
    with await app['redis'] as r:
        target_id = int(await r.brpoplpush('unsubmitted-targets',
                                           'submitting-targets'))
        target_key = f'target:{target_id}'

    # No longer need a dedicated connection.
    r = app['redis']

    # Get the odlc (encoded protobuf).
    while True:
        try:
            odlc = await r.hget(target_key, 'odlc')
        except aioredis.RedisError as e:
            logging.error(format_error('redis error', str(e)))
            await asyncio.sleep(0.1)
        else:
            break

    # Handle the submission (if not being removed).
    while True:
        try:
            unremoved = await get_int_list(r, 'unremoved-targets')
            removing = await get_int_list(r, 'removing-targets')

            if target_id not in unremoved and target_id not in removing:
                odlc_id, odlc_ret = await _post_odlc(app, odlc)

                submitted = odlc_id is not None
                errored = not submitted
                removed = False
            else:
                submitted = False
                errored = False
                removed = True
        except aioredis.RedisError as e:
            logging.error(format_error('redis error', str(e)))
            await asyncio.sleep(0.1)
        except aiohttp.ClientError as e:
            # Handle the possible non-4xx HTTP error above.
            logging.error(format_error('http error', str(e)))
            await asyncio.sleep(0.1)
        else:
            break

    # Update Redis with what happened above.
    while True:
        try:
            tr = r.multi_exec()
            tr.lrem('submitting-targets', 0, target_id)

            if submitted:
                tr.sadd('submitted-targets', target_id)
                tr.hset(target_key, 'submitted', '1')
                tr.hset(target_key, 'odlc', odlc_ret)
                logging.info(f'target {target_id} submitted as odlc '
                             f'{odlc_id}')
            elif errored:
                tr.sadd('errored-targets', target_id)
                tr.lrem('unremoved-targets', 0, target_id)
                tr.hset(target_key, 'errored', '1')
                logging.info(f'target {target_id} errored')
            elif removed:
                tr.sadd('removed-targets', target_id)
                tr.lrem('unremoved-targets', 0, target_id)
                tr.hset(target_key, 'removed', '1')
                logging.info(f'target {target_id} cancelled')

            await tr.execute()
        except aioredis.RedisError as e:
            logging.error(format_error('redis error', str(e)))
            await asyncio.sleep(0.1)
        else:
            break


async def _post_odlc(app, odlc):
    url = app['interop_url'] + '/api/odlcs'
    headers = {'Content-Type': 'application/x-protobuf'}

    async with app['http_client'].post(url, data=odlc, headers=headers) \
            as resp:
        # Return if the post data was not good (4xx).
        if resp.status // 100 == 4:
            return None, None

        resp.raise_for_status()

        # Get the returned odlc and add the image back onto it.
        sent = Odlc()
        returned = Odlc()

        content = await resp.read()

        sent = Odlc.FromString(odlc)
        returned = Odlc.FromString(content)

        returned.image = sent.image
        return returned.id, returned.SerializeToString()


# Remove targets from interop-proxy as they come in. Note that some
# might be removed in the submission task as well.
async def _remove_targets(app):
    # Acquire a connection to prevent blocking other tasks and get
    # the next target id when it comes up.
    with await app['redis'] as r:
        target_id = int(await r.brpoplpush('unremoved-targets',
                                           'removing-targets'))
        target_key = f'target:{target_id}'

    # Try and remove a target that's queued for submission.
    while True:
        try:
            async with _watch_keys(app, 'unsubmitted-targets') as r:
                unsubmitted = await get_int_list(r, 'unsubmitted-targets')

                if target_id in unsubmitted:
                    tr = r.multi_exec()
                    tr.lrem('unsubmitted-targets', 0, target_id)
                    tr.lrem('removing-targets', 0, target_id)
                    tr.sadd('removed-targets', target_id)
                    tr.hset(target_key, 'removed', '1')
                    logging.info(f'target {target_id} cancelled')

                    await tr.execute()
                    return
        except aioredis.MultiExecError:
            # The unsubmitted targets changed.
            await asyncio.sleep(0.1)
        except aioredis.RedisError as e:
            logging.error(format_error('redis error', str(e)))
            await asyncio.sleep(0.5)
        else:
            # Proceed to the next case.
            break

    r = app['redis']

    # Wait for removal if the target is being submitted and,
    # regardless, check if the target has been removed already.
    while True:
        try:
            submitting = await get_int_list(r, 'submitting-targets')

            # If the target is being submitted, wait and try it
            # again.
            if target_id in submitting:
                await asyncio.sleep(0.5)
                continue

            # If the odlc was removed we don't need to do anything
            # else to remove.
            if await r.hget(target_key, 'removed') == b'1':
                await r.lrem('removing-targets', 0, target_id)
                return
        except aioredis.RedisError as e:
            logging.error(format_error('redis error', str(e)))
            await asyncio.sleep(0.5)
        else:
            # Proceed to the next case.
            break

    # Otherwise, get the odlc id for removal.
    while True:
        try:
            odlc = await r.hget(target_key, 'odlc')
            odlc_id = Odlc.FromString(odlc).id
        except aioredis.RedisError as e:
            logging.error(format_error('redis error', str(e)))
            await asyncio.sleep(0.1)
        else:
            break

    # Remove the odlc from the interop server.
    while True:
        try:
            removed = await _delete_odlc(app, odlc_id)
        except aiohttp.ClientError as e:
            # Handle the possible non-404 HTTP error above.
            logging.error(format_error('http error', str(e)))
            await asyncio.sleep(0.1)
        else:
            break

    # Update Redis with the removal.
    while True:
        try:
            tr = r.multi_exec()
            tr.lrem('removing-targets', 0, target_id)

            if removed:
                tr.sadd('removed-targets', target_id)
                tr.hset(target_key, 'removed', '1')
                logging.info(f'target {target_id} removed')

            await tr.execute()
        except aioredis.RedisError as e:
            logging.error(format_error('redis error', str(e)))
            await asyncio.sleep(0.1)
        else:
            break


async def _delete_odlc(app, odlc_id):
    url = app['interop_url'] + f'/api/odlcs/{odlc_id}'

    async with app['http_client'].delete(url) as resp:
        # The odlc doesn't exist and so it was either deleted or
        # never submitted.
        if resp.status == 404:
            return False

        resp.raise_for_status()

        # The odlc was removed successfully.
        return True


# Acquire a Redis connection and watch keys.
@contextlib.asynccontextmanager
async def _watch_keys(app, *keys):
    with await app['redis'] as r:
        await r.watch(*keys)
        yield r
        await r.unwatch()
