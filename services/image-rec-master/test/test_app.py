import io
import json
import zipfile

from aiohttp import web
import pytest

from messages.image_rec_pb2 import PipelineImage, PipelineState, PipelineTarget
from messages.interop_pb2 import Odlc

from service.app import routes
from service.util import get_int_list, get_int_set


@pytest.fixture
async def app_client(aiohttp_client, redis):
    app = web.Application()
    app.router.add_routes(routes)
    app['redis'] = redis
    app['max_auto_targets'] = -1
    return await aiohttp_client(app)


@pytest.fixture
async def app_client_skip(aiohttp_client, redis):
    app_skip = web.Application()
    app_skip.router.add_routes(routes)
    app_skip['redis'] = redis
    app_skip['max_auto_targets'] = 3
    return await aiohttp_client(app_skip)


async def test_alive(app_client):
    resp = await app_client.get('/api/alive')
    assert resp.status == 200

    assert await resp.text() == 'Wazzup?\n'


async def test_get_pipeline(app_client, redis):
    # Updating a set and a list to test both types.
    await redis.sadd('all-images', 6)
    await redis.lpush('unprocessed-auto', 6)

    resp = await app_client.get('/api/pipeline')
    assert resp.status == 200

    msg = PipelineState.FromString(await resp.read())
    assert msg.all_images == [6]
    assert msg.unprocessed_auto == [6]
    assert msg.processed_auto == []
    assert msg.all_targets == []


async def test_get_pipeline_image_by_id(app_client, redis):
    # Add a image to fetch.
    await redis.sadd('all-images', 4)
    await redis.sadd('errored-auto', 4)
    await redis.sadd('processed-manual', 4)

    resp = await app_client.get('/api/pipeline/images/4')
    assert resp.status == 200

    ret_image = PipelineImage.FromString(await resp.read())
    assert ret_image.id == 4
    assert ret_image.processed_auto is False
    assert ret_image.errored_auto is True
    assert ret_image.skipped_auto is False
    assert ret_image.processed_manual is True
    assert ret_image.skipped_manual is False


async def test_get_pipeline_no_image(app_client):
    resp = await app_client.get('/api/pipeline/images/111')
    assert resp.status == 404


async def test_pipeline_process_auto(app_client, redis):
    # Start the processsing and then finish it.
    await redis.sadd('all-images', 3)
    await redis.lpush('unprocessed-auto', 3)

    resp = await app_client.post(
        '/api/pipeline/images/start-processing-next-auto'
    )
    assert resp.status == 200

    ret_image = PipelineImage.FromString(await resp.read())
    assert ret_image.id == 3
    assert ret_image.processed_auto is False

    resp = await app_client.post(
        '/api/pipeline/images/3/finish-processing-auto'
    )
    assert resp.status == 200

    ret_image = PipelineImage.FromString(await resp.read())
    assert ret_image.id == 3
    assert ret_image.processed_auto is True

    # We can't mark it as processed again.
    resp = await app_client.post(
        '/api/pipeline/images/3/finish-processing-auto'
    )
    assert resp.status == 409


async def test_pipeline_process_auto_no_image(app_client):
    # No image to process.
    resp = await app_client.post(
        '/api/pipeline/images/start-processing-next-auto'
    )
    assert resp.status == 409


async def test_pipeline_finish_process_auto_no_image(app_client):
    # No image to finish.
    resp = await app_client.post(
        '/api/pipeline/images/111/finish-processing-auto'
    )
    assert resp.status == 404


async def test_pipeline_process_manual(app_client, redis):
    # Start the processsing and then finish it.
    await redis.sadd('all-images', 3)
    await redis.lpush('unprocessed-manual', 3)

    resp = await app_client.post(
        '/api/pipeline/images/process-next-manual'
    )
    assert resp.status == 200

    ret_image = PipelineImage.FromString(await resp.read())
    assert ret_image.id == 3
    assert ret_image.processed_manual is True


async def test_pipeline_process_manual_no_image(app_client):
    # No image to process.
    resp = await app_client.post('/api/pipeline/images/process-next-manual')
    assert resp.status == 409


async def test_get_pipeline_target_by_id(app_client, redis):
    # Add a target to fetch.
    odlc = Odlc()
    odlc.id = 6
    target = ('id', 4, 'image_id', 5, 'odlc', odlc.SerializeToString(),
              'submitted', 1, 'errored', 0, 'removed', 0)

    await redis.sadd('all-targets', 4)
    await redis.hmset('target:4', *target)

    resp = await app_client.get('/api/pipeline/targets/4')
    assert resp.status == 200

    msg = PipelineTarget.FromString(await resp.read())
    assert msg.id == 4
    assert msg.image_id == 5
    assert msg.odlc.id == 6
    assert msg.submitted is True
    assert msg.errored is False
    assert msg.removed is False


async def test_get_pipeline_no_target(app_client, redis):
    resp = await app_client.get('/api/pipeline/targets/111')
    assert resp.status == 404


async def test_post_manual_targets(app_client, redis):
    # Add two identical manual targets, both should post and not be
    # filtered by uniqueness.
    target = PipelineTarget()
    target.image_id = 2
    target.odlc.shape = Odlc.SQUARE
    target.odlc.autonomous = False

    resp = await app_client.post('/api/pipeline/targets',
                                 data=target.SerializeToString())
    assert resp.status == 201

    ret_target = PipelineTarget.FromString(await resp.read())
    assert ret_target.id == 1
    assert ret_target.image_id == 2
    assert ret_target.odlc.shape == Odlc.SQUARE
    assert ret_target.odlc.autonomous is False
    assert ret_target.submitted is False
    assert ret_target.errored is False
    assert ret_target.removed is False

    resp = await app_client.post('/api/pipeline/targets',
                                 data=target.SerializeToString())
    assert resp.status == 201

    ret_target = PipelineTarget.FromString(await resp.read())
    assert ret_target.id == 2
    assert ret_target.image_id == 2
    assert ret_target.odlc.shape == Odlc.SQUARE
    assert ret_target.odlc.autonomous is False
    assert ret_target.submitted is False
    assert ret_target.errored is False
    assert ret_target.removed is False

    # Getting the targets back as well to check.
    resp = await app_client.get('/api/pipeline/targets/1')
    assert resp.status == 200

    ret_target = PipelineTarget.FromString(await resp.read())
    assert ret_target.id == 1
    assert ret_target.image_id == 2
    assert ret_target.odlc.shape == Odlc.SQUARE
    assert ret_target.odlc.autonomous is False
    assert ret_target.submitted is False
    assert ret_target.errored is False
    assert ret_target.removed is False

    resp = await app_client.get('/api/pipeline/targets/2')
    assert resp.status == 200

    ret_target = PipelineTarget.FromString(await resp.read())
    assert ret_target.id == 2
    assert ret_target.image_id == 2
    assert ret_target.odlc.shape == Odlc.SQUARE
    assert ret_target.odlc.autonomous is False
    assert ret_target.submitted is False
    assert ret_target.errored is False
    assert ret_target.removed is False

    assert await get_int_set(redis, 'all-targets') == [1, 2]
    assert await get_int_list(redis, 'unsubmitted-targets') == [2, 1]


async def test_post_auto_targets(app_client, redis):
    # Add two identical auto targets, one should post and not be
    # filtered by uniqueness.
    target = PipelineTarget()
    target.image_id = 2
    target.odlc.shape = Odlc.SQUARE
    target.odlc.autonomous = True

    resp = await app_client.post('/api/pipeline/targets',
                                 data=target.SerializeToString())
    assert resp.status == 201

    ret_target = PipelineTarget.FromString(await resp.read())
    assert ret_target.id == 1
    assert ret_target.image_id == 2
    assert ret_target.odlc.shape == Odlc.SQUARE
    assert ret_target.odlc.autonomous is True
    assert ret_target.submitted is False
    assert ret_target.errored is False
    assert ret_target.removed is False

    resp = await app_client.post('/api/pipeline/targets',
                                 data=target.SerializeToString(),
                                 allow_redirects=False)
    assert resp.status == 303
    assert resp.headers['Location'] == '/api/pipeline/targets/1'

    # Getting the target back as well to check.
    resp = await app_client.get('/api/pipeline/targets/1')
    assert resp.status == 200

    ret_target = PipelineTarget.FromString(await resp.read())
    assert ret_target.id == 1
    assert ret_target.image_id == 2
    assert ret_target.odlc.shape == Odlc.SQUARE
    assert ret_target.odlc.autonomous is True
    assert ret_target.submitted is False
    assert ret_target.errored is False
    assert ret_target.removed is False

    assert await get_int_set(redis, 'all-targets') == [1]
    assert await get_int_list(redis, 'unsubmitted-targets') == [1]


async def test_post_auto_targets_unique(app_client, redis):
    # Add two different auto targets, both should post
    target_1 = PipelineTarget()
    target_1.image_id = 2
    target_1.odlc.shape = Odlc.SQUARE
    target_1.odlc.background_color = Odlc.RED
    target_1.odlc.autonomous = True

    target_2 = PipelineTarget()
    target_2.image_id = 2
    target_2.odlc.shape = Odlc.CIRCLE
    target_2.odlc.alphanumeric = 'Z'
    target_2.odlc.autonomous = True

    resp = await app_client.post('/api/pipeline/targets',
                                 data=target_1.SerializeToString())
    assert resp.status == 201

    ret_target = PipelineTarget.FromString(await resp.read())
    assert ret_target.id == 1
    assert ret_target.image_id == 2
    assert ret_target.odlc.shape == Odlc.SQUARE
    assert ret_target.odlc.background_color == Odlc.RED
    assert ret_target.odlc.autonomous is True
    assert ret_target.submitted is False
    assert ret_target.errored is False
    assert ret_target.removed is False

    resp = await app_client.post('/api/pipeline/targets',
                                 data=target_2.SerializeToString())
    assert resp.status == 201

    ret_target = PipelineTarget.FromString(await resp.read())
    assert ret_target.id == 2
    assert ret_target.image_id == 2
    assert ret_target.odlc.shape == Odlc.CIRCLE
    assert ret_target.odlc.alphanumeric == 'Z'
    assert ret_target.odlc.autonomous is True
    assert ret_target.submitted is False
    assert ret_target.errored is False
    assert ret_target.removed is False

    # Getting the targets back as well to check.
    resp = await app_client.get('/api/pipeline/targets/1')
    assert resp.status == 200

    ret_target = PipelineTarget.FromString(await resp.read())
    assert ret_target.id == 1
    assert ret_target.image_id == 2
    assert ret_target.odlc.shape == Odlc.SQUARE
    assert ret_target.odlc.background_color == Odlc.RED
    assert ret_target.odlc.autonomous is True
    assert ret_target.submitted is False
    assert ret_target.errored is False
    assert ret_target.removed is False

    resp = await app_client.get('/api/pipeline/targets/2')
    assert resp.status == 200

    ret_target = PipelineTarget.FromString(await resp.read())
    assert ret_target.id == 2
    assert ret_target.image_id == 2
    assert ret_target.odlc.shape == Odlc.CIRCLE
    assert ret_target.odlc.alphanumeric == 'Z'
    assert ret_target.odlc.autonomous is True
    assert ret_target.submitted is False
    assert ret_target.errored is False
    assert ret_target.removed is False

    assert await get_int_set(redis, 'all-targets') == [1, 2]
    assert await get_int_list(redis, 'unsubmitted-targets') == [2, 1]


async def test_post_auto_targets_cap(aiohttp_client, redis):
    # Make an app instance with a cap of 3.
    app = web.Application()
    app.router.add_routes(routes)
    app['redis'] = redis
    app['max_auto_targets'] = 3
    app_client = await aiohttp_client(app)

    # Making a bunch of unique targets to work with to not have
    # uniqueness interfere.
    targets = []
    shapes = [Odlc.SQUARE, Odlc.STAR, Odlc.CIRCLE, Odlc.CROSS, Odlc.OCTAGON,
              Odlc.RECTANGLE]
    colors = [Odlc.RED, Odlc.BLUE, Odlc.BLACK, Odlc.ORANGE, Odlc.GREEN,
              Odlc.PURPLE]

    for i in range(6):
        target = PipelineTarget()
        target.odlc.shape = shapes[i]
        target.odlc.background_color = colors[i]
        target.odlc.autonomous = True
        targets.append(target)

    # Submit the target up to the cap.
    for i in range(3):
        resp = await app_client.post('/api/pipeline/targets',
                                     data=targets[i].SerializeToString())
        assert resp.status == 201

    # Shouldn't work now since we're at the cap.
    resp = await app_client.post('/api/pipeline/targets',
                                 data=targets[3].SerializeToString())
    assert resp.status == 204

    # Remove one and we should be able to submit just one more.
    resp = await app_client.post('/api/pipeline/targets/1/queue-removal')
    assert resp.status == 204

    resp = await app_client.post('/api/pipeline/targets',
                                 data=targets[4].SerializeToString())
    assert resp.status == 201

    resp = await app_client.post('/api/pipeline/targets',
                                 data=targets[5].SerializeToString())
    assert resp.status == 204


async def test_post_targets_skip(app_client_skip, redis):
    # add max_auto_targets targets, then post another, then remove one
    redis.lpush('unprocessed-auto', 5)
    redis.lpush('processing-auto', 6)

    assert await get_int_list(redis, 'unprocessed-auto') == [5]
    assert await get_int_list(redis, 'processing-auto') == [6]

    targets = []
    shapes = [Odlc.SQUARE, Odlc.STAR, Odlc.CIRCLE, Odlc.CROSS]
    colors = [Odlc.RED, Odlc.BLUE, Odlc.BLACK, Odlc.ORANGE]

    for i in range(4):
        target = PipelineTarget()
        target.odlc.shape = shapes[i]
        target.odlc.background_color = colors[i]
        target.odlc.autonomous = True
        target.id = i
        targets.append(target)

    # Submit the target up to the cap.
    for i in range(3):
        resp = await app_client_skip.post('/api/pipeline/targets',
                                          data=targets[i].SerializeToString())
        assert resp.status == 201

    # Post another, should be moved to skip
    resp = await app_client_skip.post('/api/pipeline/targets',
                                      data=targets[3].SerializeToString())
    assert resp.status == 204

    # Check that auto processsing and unprocessed lists are empty
    # And were also moved to the skip list
    assert await get_int_list(redis, 'skipped-auto') == [0, 6, 5]
    assert await get_int_list(redis, 'processing-auto') == []
    assert await get_int_list(redis, 'unprocessed-auto') == []

    # Remove one
    resp = await app_client_skip.post('/api/pipeline/targets/1' +
                                      '/queue-removal')
    assert resp.status == 204

    # Double check
    assert await get_int_list(redis, 'processing-auto') == []
    assert await get_int_list(redis, 'unremoved-targets') == [1]
    assert await get_int_list(redis, 'unprocessed-auto') == []


async def test_queue_target_removal(app_client, redis):
    # Queue a target for removal, and then try again to make it 409.
    resp = await app_client.post('/api/pipeline/targets',
                                 data=PipelineTarget().SerializeToString())
    assert resp.status == 201

    resp = await app_client.post('/api/pipeline/targets/1/queue-removal')
    assert resp.status == 204
    assert await get_int_list(redis, 'unremoved-targets') == [1]

    resp = await app_client.post('/api/pipeline/targets/1/queue-removal')
    assert resp.status == 409


async def test_queue_target_removal_no_exist(app_client):
    resp = await app_client.post('/api/pipeline/targets/1/queue-removal')
    assert resp.status == 404


async def test_reset_pipeline(app_client, redis):
    await redis.sadd('all-images', 1)

    resp = await app_client.post('/api/pipeline/reset')
    assert resp.status == 204

    assert await redis.smembers('all-images') == []


async def test_get_pipeline_archive(app_client, redis):
    # Add a target for the archive.
    odlc = Odlc()
    odlc.id = 7
    odlc.pos.lat = 12.0
    odlc.pos.lon = -13.5
    odlc.shape = Odlc.SQUARE
    odlc.background_color = Odlc.RED
    odlc.image = b'test-image'
    target = ('id', 5, 'image_id', 6, 'odlc', odlc.SerializeToString(),
              'submitted', 1, 'errored', 0, 'removed', 0)

    await redis.sadd('all-targets', 5)
    await redis.hmset('target:5', *target)

    resp = await app_client.get('/api/pipeline/archive')
    assert resp.status == 200

    b = io.BytesIO(await resp.read())

    with zipfile.ZipFile(b) as backup:
        with backup.open('1.json') as meta_file:
            meta = json.loads(meta_file.read())

            assert meta['type'] == 'standard'
            assert 'id' not in meta
            assert meta['latitude'] == 12.0
            assert meta['longitude'] == -13.5
            assert meta['shape'] == 'square'
            assert meta['background_color'] == 'red'

        with backup.open('1.jpg') as image_file:
            assert image_file.read() == b'test-image'


async def test_get_pipeline_empty_archive(app_client, redis):
    resp = await app_client.get('/api/pipeline/archive')
    assert resp.status == 204
