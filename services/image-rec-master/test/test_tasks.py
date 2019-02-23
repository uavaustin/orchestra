from aiohttp import ClientSession, web
from aioresponses import aioresponses
import pytest

from messages.imagery_pb2 import AvailableImages

import service.tasks
from service.util import get_int_list, get_int_set


@pytest.fixture
async def app(aiohttp_client, redis):
    app = web.Application()
    app['redis'] = redis
    app['http_client'] = ClientSession()
    app['imagery_url'] = 'http://imagery:1234'
    app['interop_url'] = 'http://interop-proxy:1234'

    yield app

    await app['http_client'].close()


@pytest.fixture
def http_mock():
    with aioresponses() as m:
        yield m


async def test_queue_new_images_no_images(app, redis, http_mock):
    available_images = AvailableImages()
    available_images.id_list.extend([])

    http_mock.get('http://imagery:1234/api/available',
                  body=available_images.SerializeToString(),
                  headers={'Content-Type': 'application/x-protobuf'})

    await service.tasks.queue_new_images(app)

    assert await get_int_set(redis, 'all-images') == []
    assert await get_int_list(redis, 'unprocessed-auto') == []
    assert await get_int_list(redis, 'unprocessed-manual') == []


async def test_queue_new_images_with_images(app, redis, http_mock):
    available_images = AvailableImages()
    available_images.id_list.extend([1, 2])

    http_mock.get('http://imagery:1234/api/available',
                  body=available_images.SerializeToString(),
                  headers={'Content-Type': 'application/x-protobuf'})

    await service.tasks.queue_new_images(app)

    assert await get_int_set(redis, 'all-images') == [1, 2]
    assert await get_int_list(redis, 'unprocessed-auto') == [2, 1]
    assert await get_int_list(redis, 'unprocessed-manual') == [2, 1]


async def test_queue_new_images_no_images_existing(app, redis, http_mock):
    await redis.sadd('all-images', 2)
    await redis.lpush('unprocessed-auto', 2)
    await redis.lpush('unprocessed-manual', 2)

    available_images = AvailableImages()
    available_images.id_list.extend([])

    http_mock.get('http://imagery:1234/api/available',
                  body=available_images.SerializeToString(),
                  headers={'Content-Type': 'application/x-protobuf'})

    await service.tasks.queue_new_images(app)

    assert await get_int_set(redis, 'all-images') == [2]
    assert await get_int_list(redis, 'unprocessed-auto') == [2]
    assert await get_int_list(redis, 'unprocessed-manual') == [2]


async def test_queue_new_images_with_images_existing(app, redis, http_mock):
    await redis.sadd('all-images', 2)
    await redis.lpush('unprocessed-auto', 2)
    await redis.lpush('unprocessed-manual', 2)

    available_images = AvailableImages()
    available_images.id_list.extend([1, 2])

    http_mock.get('http://imagery:1234/api/available',
                  body=available_images.SerializeToString(),
                  headers={'Content-Type': 'application/x-protobuf'})

    await service.tasks.queue_new_images(app)

    assert await get_int_set(redis, 'all-images') == [1, 2]
    assert await get_int_list(redis, 'unprocessed-auto') == [1, 2]
    assert await get_int_list(redis, 'unprocessed-manual') == [1, 2]


async def test_requeue_auto_images_no_error(app, redis):
    # Add image 2, and let it process without error, also add image
    # 3 later which shouldn't affect.

    await redis.lpush('processing-auto', 2)

    await service.tasks.requeue_auto_images(app)

    assert await get_int_list(redis, 'unprocessed-auto') == []
    assert await get_int_list(redis, 'processing-auto') == [2]
    assert await get_int_set(redis, 'processed-auto') == []
    assert await get_int_set(redis, 'retrying-auto') == []
    assert await get_int_set(redis, 'errored-auto') == []

    await redis.lrem('processing-auto', 0, 2)
    await redis.sadd('processed-auto', 2)
    await redis.lpush('processing-auto', 3)

    await service.tasks.requeue_auto_images(app)

    assert await get_int_list(redis, 'unprocessed-auto') == []
    assert await get_int_list(redis, 'processing-auto') == [3]
    assert await get_int_set(redis, 'processed-auto') == [2]
    assert await get_int_set(redis, 'retrying-auto') == []
    assert await get_int_set(redis, 'errored-auto') == []


async def test_requeue_auto_images_error_once_immediate(app, redis):
    # Add image 2, and let it stall, also add 3 which does not stall
    # and doesn't interfere. Image 2 works the second time.

    await redis.lpush('processing-auto', 2)

    await service.tasks.requeue_auto_images(app)

    await redis.lpush('processing-auto', 3)

    await service.tasks.requeue_auto_images(app)

    assert await get_int_list(redis, 'unprocessed-auto') == [2]
    assert await get_int_list(redis, 'processing-auto') == [3]
    assert await get_int_set(redis, 'processed-auto') == []
    assert await get_int_set(redis, 'retrying-auto') == [2]
    assert await get_int_set(redis, 'errored-auto') == []

    await redis.lrem('unprocessed-auto', 0, 2)
    await redis.lpush('processing-auto', 2)
    await redis.lrem('processing-auto', 0, 3)
    await redis.sadd('processed-auto', 3)

    await service.tasks.requeue_auto_images(app)

    assert await get_int_list(redis, 'unprocessed-auto') == []
    assert await get_int_list(redis, 'processing-auto') == [2]
    assert await get_int_set(redis, 'processed-auto') == [3]
    assert await get_int_set(redis, 'retrying-auto') == [2]
    assert await get_int_set(redis, 'errored-auto') == []

    await redis.lrem('processing-auto', 0, 2)
    await redis.sadd('processed-auto', 2)

    await service.tasks.requeue_auto_images(app)

    assert await get_int_list(redis, 'unprocessed-auto') == []
    assert await get_int_list(redis, 'processing-auto') == []
    assert await get_int_set(redis, 'processed-auto') == [2, 3]
    assert await get_int_set(redis, 'retrying-auto') == [2]
    assert await get_int_set(redis, 'errored-auto') == []


async def test_requeue_auto_images_error_once_delay(app, redis):
    # Add image 2, and let it stall. Run a couple iterations before
    # processing 2 again.

    await redis.lpush('processing-auto', 2)

    await service.tasks.requeue_auto_images(app)
    await service.tasks.requeue_auto_images(app)
    await service.tasks.requeue_auto_images(app)

    await redis.lrem('unprocessed-auto', 0, 2)
    await redis.lpush('processing-auto', 2)

    await service.tasks.requeue_auto_images(app)

    assert await get_int_list(redis, 'unprocessed-auto') == []
    assert await get_int_list(redis, 'processing-auto') == [2]
    assert await get_int_set(redis, 'processed-auto') == []
    assert await get_int_set(redis, 'retrying-auto') == [2]
    assert await get_int_set(redis, 'errored-auto') == []

    await service.tasks.requeue_auto_images(app)


async def test_requeue_auto_images_error_twice(app, redis):
    # Add image 2, and let it stall, also add 3 which does not stall
    # and doesn't interfere. Image 2 fails the second time.

    await redis.lpush('processing-auto', 2)

    await service.tasks.requeue_auto_images(app)

    await redis.lpush('processing-auto', 3)

    await service.tasks.requeue_auto_images(app)

    await redis.lrem('unprocessed-auto', 0, 2)
    await redis.lpush('processing-auto', 2)
    await redis.lrem('processing-auto', 0, 3)
    await redis.sadd('processed-auto', 3)

    await service.tasks.requeue_auto_images(app)
    await service.tasks.requeue_auto_images(app)

    assert await get_int_list(redis, 'unprocessed-auto') == []
    assert await get_int_list(redis, 'processing-auto') == []
    assert await get_int_set(redis, 'processed-auto') == [3]
    assert await get_int_set(redis, 'retrying-auto') == []
    assert await get_int_set(redis, 'errored-auto') == [2]
