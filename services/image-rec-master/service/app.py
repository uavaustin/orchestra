from time import time

from aiohttp import web
from google.protobuf.json_format import MessageToJson

import image_rec_pb2

from .backup import create_archive
from .tasks import start_tasks, stop_tasks
from .util import get_int_set


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

    msg = image_rec_pb2.PipelineState()
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


@routes.get(r'/api/pipeline/targets/{id:\d+}')
async def handle_get_pipeline_target_by_id(request):
    """Return a target by id in the pipeline."""
    target_id = int(request.match_info['id'])
    target = await _get_target(request, target_id)

    if target:
        return _proto_response(request, target)
    else:
        return web.Response(status=404)


@routes.post('/api/pipeline/reset')
async def handle_reset_pipeline(request):
    """Empty out the current Redis database to reset the pipeline."""
    await request.app['redis'].flushdb()
    return web.Response(status=204)


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
            'Content-Disposition': 'attachment; filename="targets.zip"'
        })
    else:
        return web.Response(status=204)


async def _get_target(request, target_id):
    target_hash = await request.app['redis'].hgetall(f'target:{target_id}')

    if target_hash:
        msg = image_rec_pb2.Target()
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


def _proto_response(request, msg):
    """Return a protobuf wire or JSON response."""
    if not request.headers.getone('accept', '').startswith('application/json'):
        body = msg.SerializeToString()
        return web.Response(body=body, content_type='application/x-protobuf')
    else:
        body = MessageToJson(msg)
        return web.json_response(body=body)


def create_app():
    """Create an aiohttp web application."""
    app = web.Application()
    app.on_startup.append(start_tasks)
    app.on_shutdown.append(stop_tasks)
    app.router.add_routes(routes)

    return app
