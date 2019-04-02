import asyncio
from time import time

from aiohttp import web
import aioredis
import google.protobuf.json_format

from messages.image_rec_pb2 import PipelineImage, PipelineState, PipelineTarget
from messages.interop_pb2 import Odlc

from .backup import create_archive
from . import tasks
from .util import get_int_list, get_int_set, watch_keys


routes = web.RouteTableDef()


@routes.get('/api/alive')
async def handle_alive(request):
    """Send back text as a sanity check."""
    return web.Response(text='Wazzup?\n')


@routes.get('/api/pipeline')
async def handle_get_pipeline(request):
    """Return the current pipeline state."""
    tr = request.app['redis'].multi_exec()

    def get_set(key):
        tr.smembers(key)

    def get_list(key):
        tr.lrange(key, 0, -1)

    # All registered images.
    get_set('all-images')

    # Auto image rec state.
    get_list('unprocessed-auto')
    get_list('processing-auto')
    get_set('processed-auto')
    get_set('retrying-auto')
    get_set('errored-auto')
    get_set('skipped-auto')

    # Manual image rec state.
    get_list('unprocessed-manual')
    get_set('processed-manual')
    get_set('skipped-manual')

    # Target submission state.
    get_set('all-targets')
    get_list('unsubmitted-targets')
    get_list('submitting-targets')
    get_set('submitted-targets')
    get_set('errored-targets')
    get_list('unremoved-targets')
    get_list('removing-targets')
    get_set('removed-targets')

    data_str = await tr.execute()

    msg = PipelineState()
    msg.time = time()

    fields = [
        msg.all_images,
        msg.unprocessed_auto,
        msg.processing_auto,
        msg.processed_auto,
        msg.retrying_auto,
        msg.errored_auto,
        msg.skipped_auto,
        msg.unprocessed_manual,
        msg.processed_manual,
        msg.skipped_manual,
        msg.all_targets,
        msg.unsubmitted_targets,
        msg.submitting_targets,
        msg.submitted_targets,
        msg.errored_targets,
        msg.unremoved_targets,
        msg.removing_targets,
        msg.removed_targets
    ]

    # Convert the string lists to integer lists and add them to the
    # proto message.
    for field, str_list in zip(fields, data_str):
        field.extend([int(id_str) for id_str in str_list])
        field.sort()

    return _proto_response(request, msg)


@routes.get(r'/api/pipeline/images/{id:\d+}')
async def handle_get_pipeline_image_by_id(request):
    """Return an image by id in the pipeline."""
    image_id = int(request.match_info['id'])
    image = await _get_image(request, image_id)

    if image:
        return _proto_response(request, image)
    else:
        return web.HTTPNotFound()


@routes.post('/api/pipeline/images/start-processing-next-auto')
async def handle_process_next_auto_pipeline_image(request):
    """Start the processing window for the next auto image."""
    id_str = await request.app['redis'].rpoplpush('unprocessed-auto',
                                                  'processing-auto')

    if id_str:
        image_id = int(id_str)
        image = await _get_image(request, image_id)
        return _proto_response(request, image)
    else:
        return web.HTTPConflict()


@routes.post(r'/api/pipeline/images/{id:\d+}/finish-processing-auto')
async def handle_processed_auto_pipeline_image(request):
    """Mark the auto processing as finished for an image."""
    image_id = int(request.match_info['id'])

    while True:
        try:
            # Needing to move an item from a list to a set.
            async with watch_keys(request.app, 'processing-auto') as r:
                all_images = await get_int_set(r, 'all-images')
                processing = await get_int_list(r, 'processing-auto')

                if image_id not in all_images:
                    return web.HTTPNotFound()

                if image_id not in processing:
                    return web.HTTPConflict()

                tr = r.multi_exec()
                tr.lrem('processing-auto', 0, image_id)
                tr.sadd('processed-auto', image_id)
                await tr.execute()
        except aioredis.MultiExecError:
            # A target was removed from the processing list.
            await asyncio.sleep(0.1)
        else:
            break

    image = await _get_image(request, image_id)
    return _proto_response(request, image)


@routes.post('/api/pipeline/images/process-next-manual')
async def handle_process_next_auto_pipeline_image(request):
    """Mark the next manual image as processed."""
    # Needing to move an item from a list to a set.
    async with watch_keys(request.app, 'unprocessed-manual') as r:
        id_str = await r.lindex('unprocessed-manual', -1)

        if not id_str:
            return web.HTTPConflict()

        image_id = int(id_str)

        tr = r.multi_exec()
        tr.rpop('unprocessed-manual')
        tr.sadd('processed-manual', image_id)
        await tr.execute()

    image = await _get_image(request, image_id)
    return _proto_response(request, image)


@routes.get(r'/api/pipeline/targets/{id:\d+}')
async def handle_get_pipeline_target_by_id(request):
    """Return a target by id in the pipeline."""
    target_id = int(request.match_info['id'])
    target = await _get_target(request, target_id)

    if target:
        return _proto_response(request, target)
    else:
        return web.HTTPNotFound()


@routes.post('/api/pipeline/targets')
async def handle_post_pipeline_target(request):
    """Create a target from an odlc."""
    # Reading submitted target, we only care about the odlc and
    # source image.
    target = await _parse_body(request, PipelineTarget)
    odlc = target.odlc
    image_id = target.image_id

    # Have to wrap this in the case another target is submitted at
    # the same time. Note that if during the process, a target is
    # found to not be unique, a HTTP 303 request will be returned
    # with the similar target.
    while True:
        try:
            # Operation repeats if something is being submitted or
            # removed, so the target count is correct, or if a target
            # does not need to be referenced for uniqueness.
            async with watch_keys(request.app, 'all-targets',
                                  'unremoved-targets') as r:
                # Check for uniqueness
                if odlc.autonomous and odlc.type == Odlc.STANDARD:
                    # Reference target ids.
                    ref_ids = await get_int_set(r, 'auto-standard-targets')

                    # Reference targets (using separate transaction).
                    tr = request.app['redis'].multi_exec()

                    for ref_id in ref_ids:
                        tr.hgetall(f'auto-standard-targets:{ref_id}')

                    # If there are two or three similarities between
                    # shape, background color, and alphanumeric,
                    # then the target is not unique.
                    for ref in await tr.execute():
                        ref_id = int(ref.get(b'id', b'0'))
                        ref_shape = int(ref.get(b'shape', b'0'))
                        ref_color = int(ref.get(b'color', b'0'))
                        ref_alpha = str(ref.get(b'alpha', b''))

                        if sum([odlc.shape == ref_shape,
                                odlc.background_color == ref_color,
                                odlc.alphanumeric == ref_alpha]) >= 2:
                            # Redirect with the similar target.
                            return web.HTTPSeeOther(
                                f'/api/pipeline/targets/{ref_id}'
                            )

                # Id is 1 if no target exists. Increments after.
                target_id = int(await r.get('target-count') or 0) + 1

                redis_target = ('id', target_id, 'image_id', image_id, 'odlc',
                                odlc.SerializeToString(), 'submitted', 0,
                                'errored', 0, 'removed', 0)

                tr = r.multi_exec()

                tr.incr('target-count')
                tr.sadd('all-targets', target_id)
                tr.lpush('unsubmitted-targets', target_id)
                tr.hmset(f'target:{target_id}', *redis_target)

                # For checking for uniqueness.
                if odlc.autonomous and odlc.type == Odlc.STANDARD:
                    # Target characteristics
                    chars = ('id', target_id, 'shape', odlc.shape, 'color',
                             odlc.background_color, 'alpha', odlc.alphanumeric)

                    tr.sadd('auto-standard-targets', target_id)
                    tr.hmset(f'auto-standard-targets:{target_id}', *chars)

                await tr.execute()
        except aioredis.MultiExecError:
            # The amount of targets changed.
            await asyncio.sleep(0.1)
        else:
            break

    # Update the target to return back to the caller. Settings
    # fields manually instead of using incoming target in case
    # the caller added fields. Submitted / errored / removed
    # default to `False`.
    ret_target = PipelineTarget()
    ret_target.time = time()
    ret_target.id = target_id
    ret_target.odlc.CopyFrom(target.odlc)
    ret_target.image_id = target.image_id

    return _proto_response(request, ret_target, status=201)


@routes.post(r'/api/pipeline/targets/{id:\d+}/queue-removal')
async def handle_queue_pipeline_target_removal(request):
    """Queue a target to be removed."""
    target_id = int(request.match_info['id'])

    # Have to wrap this in the case another target is removed at
    # the same time. If the target doesn't exist, 404, if the target
    # can't be removed, 409.
    while True:
        try:
            # Operation repeats if something is being submitted or
            # removed, just in case the target no longer can be
            # removed.
            async with watch_keys(request.app, 'all-targets',
                                  'unremoved-targets') as r:
                all_targets = await get_int_set(r, 'all-targets')

                if target_id not in all_targets:
                    return web.HTTPNotFound()

                # New transaction for checking if the target is in
                # one of the removal lists. The watch won't apply to
                # this one.
                tr = request.app['redis'].multi_exec()
                tr.lrange('unremoved-targets', 0, -1)
                tr.lrange('removing-targets', 0, -1)
                tr.smembers('removed-targets')
                lists = await tr.execute()

                # All targets in any removal list.
                remove_ids = [int(id_str) for list in lists for id_str in list]

                if target_id in remove_ids:
                    return web.HTTPConflict()

                # Transaction with the watch. Queue the removal.
                tr = r.multi_exec()
                tr.lpush('unremoved-targets', target_id)
                await tr.execute()
        except aioredis.MultiExecError:
            # The amount of targets changed.
            await asyncio.sleep(0.1)
        else:
            break

    return web.HTTPNoContent()


@routes.post('/api/pipeline/reset')
async def handle_reset_pipeline(request):
    """Empty out the current Redis database to reset the pipeline."""
    await request.app['redis'].flushdb()
    return web.HTTPNoContent()


@routes.get('/api/pipeline/archive')
async def handle_get_pipeline_archive(request):
    """Return an archive for backup target submission."""
    odlcs = []
    target_ids = await get_int_set(request.app['redis'], 'all-targets')

    for target_id in target_ids:
        target = await _get_target(request, target_id)

        # Add the target if it hasn't errored or been removed.
        if not target.errored and not target.removed:
            odlcs.append(target.odlc)

    archive = create_archive(odlcs)

    if archive:
        return web.Response(body=archive, headers={
            'Content-Disposition': 'attachment; filename="targets.zip"',
            'Content-Type': 'application/zip'
        })
    else:
        return web.HTTPNoContent()


async def _get_image(request, image_id):
    tr = request.app['redis'].multi_exec()

    tr.smembers('all-images')
    tr.smembers('processed-auto')
    tr.smembers('errored-auto')
    tr.smembers('skipped-auto')
    tr.smembers('processed-manual')
    tr.smembers('skipped-manual')

    str_sets = await tr.execute()
    sets = [[int(id_str) for id_str in str_set] for str_set in str_sets]

    if image_id in sets[0]:
        msg = PipelineImage()
        msg.time = time()

        msg.id = image_id
        msg.processed_auto = image_id in sets[1]
        msg.errored_auto = image_id in sets[2]
        msg.skipped_auto = image_id in sets[3]
        msg.processed_manual = image_id in sets[4]
        msg.skipped_manual = image_id in sets[5]

        return msg
    else:
        return None


async def _get_target(request, target_id):
    target_hash = await request.app['redis'].hgetall(f'target:{target_id}')

    if target_hash:
        msg = PipelineTarget()
        msg.time = time()

        msg.id = int(target_hash.get(b'id', b'0'))
        msg.image_id = int(target_hash.get(b'image_id', b'0'))
        msg.odlc.ParseFromString(target_hash.get(b'odlc', b''))
        msg.submitted = target_hash.get(b'submitted', b'0') == b'1'
        msg.errored = target_hash.get(b'errored', b'0') == b'1'
        msg.removed = target_hash.get(b'removed', b'0') == b'1'

        return msg
    else:
        return None


def _proto_response(request, msg, status=200):
    """Return a protobuf wire or JSON response."""
    if not request.headers.getone('accept', '').startswith('application/json'):
        body = msg.SerializeToString()
        return web.Response(body=body, status=status,
                            content_type='application/x-protobuf')
    else:
        body = google.protobuf.json_format.MessageToJson(msg)
        return web.json_response(body=body)


async def _parse_body(request, msg_type):
    """Parse a protobuf wire or JSON body."""
    body = await request.content.read(-1)

    if not request.headers.getone('content-type', '') \
            .startswith('application/json'):
        return msg_type.FromString(body)
    else:
        msg = msg_type()
        google.protobuf.json_format.Parse(body, msg)
        return msg


def create_app():
    """Create an aiohttp web application."""
    app = web.Application()
    app.on_startup.append(_start_tasks)
    app.on_shutdown.append(_stop_tasks)
    app.router.add_routes(routes)

    return app


async def _start_tasks(app):
    app_tasks = []
    app_tasks.append(_schedule_task(app, tasks.queue_new_images, 0.5))
    app_tasks.append(_schedule_task(app, tasks.requeue_auto_images, 15.0))
    app_tasks.append(_schedule_task(app, tasks.submit_targets, 0.0))
    app_tasks.append(_schedule_task(app, tasks.remove_targets, 0.0))

    app['tasks'] = app_tasks


async def _stop_tasks(app):
    for app_task in app['tasks']:
        app_task.cancel()


def _schedule_task(app, coro, interval):
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

    return asyncio.create_task(wrapped(app))
