import pytest

from messages.image_rec_pb2 import PipelineState, Target

from service.app import create_app


@pytest.fixture
async def app_client(aiohttp_client, redis):
    app = create_app()
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


async def test_reset_pipeline(app_client, redis):
    await redis.sadd('all-images', 1)

    resp = await app_client.post('/api/pipeline/reset')
    assert resp.status == 204

    assert await redis.smembers('all-images') == []
