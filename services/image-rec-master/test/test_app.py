from aiohttp import web
import pytest

from messages.image_rec_pb2 import PipelineState, Target
from messages.interop_pb2 import Odlc

from service.app import routes


@pytest.fixture
async def app_client(aiohttp_client, redis):
    app = web.Application()
    app.router.add_routes(routes)
    app['redis'] = redis
    return await aiohttp_client(app)


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

    msg = Target.FromString(await resp.read())
    assert msg.id == 4
    assert msg.image_id == 5
    assert msg.odlc.id == 6
    assert msg.submitted is True
    assert msg.errored is False
    assert msg.removed is False


async def test_get_pipeline_no_target(app_client, redis):
    resp = await app_client.get('/api/pipeline/targets/111')
    assert resp.status == 404


async def test_reset_pipeline(app_client, redis):
    await redis.sadd('all-images', 1)

    resp = await app_client.post('/api/pipeline/reset')
    assert resp.status == 204

    assert await redis.smembers('all-images') == []
