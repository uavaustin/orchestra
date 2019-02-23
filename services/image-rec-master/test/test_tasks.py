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
