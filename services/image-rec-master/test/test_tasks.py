from aiohttp import ClientSession, web
from aioresponses import CallbackResult, aioresponses
import pytest

from messages.imagery_pb2 import AvailableImages
from messages.interop_pb2 import Odlc

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


async def test_submit_targets(app, redis, http_mock):
    odlc = Odlc()
    odlc.type = Odlc.EMERGENT
    odlc.pos.lat = 12.01
    odlc.pos.lon = -13.51
    odlc.description = 'test test'
    odlc.image = b'test-image'
    target = ('id', 5, 'image_id', 6, 'odlc', odlc.SerializeToString(),
              'submitted', 0, 'errored', 0, 'removed', 0)

    post_odlc = Odlc()
    post_odlc.type = Odlc.EMERGENT
    post_odlc.id = 2
    post_odlc.pos.lat = 12.01
    post_odlc.pos.lon = -13.51
    post_odlc.description = 'test test'

    await redis.sadd('all-targets', 5)
    await redis.lpush('unsubmitted-targets', 5)
    await redis.hmset('target:5', *target)

    def post_cb(url, data, **kwargs):
        assert data == odlc.SerializeToString()
        return CallbackResult(
            status=201, body=post_odlc.SerializeToString(),
            headers={'Content-Type': 'application/x-protobuf'}
        )

    http_mock.post('http://interop-proxy:1234/api/odlcs', callback=post_cb)

    await service.tasks.submit_targets(app)

    end_odlc = Odlc()
    end_odlc.type = Odlc.EMERGENT
    end_odlc.id = 2
    end_odlc.pos.lat = 12.01
    end_odlc.pos.lon = -13.51
    end_odlc.description = 'test test'
    end_odlc.image = b'test-image'

    assert await get_int_set(redis, 'all-targets') == [5]
    assert await get_int_set(redis, 'submitted-targets') == [5]
    assert await get_int_set(redis, 'errored-targets') == []
    assert await get_int_set(redis, 'removed-targets') == []
    assert await get_int_list(redis, 'unsubmitted-targets') == []
    assert await get_int_list(redis, 'submitting-targets') == []
    assert await redis.hgetall('target:5') == {
        b'id': b'5', b'image_id': b'6', b'odlc': end_odlc.SerializeToString(),
        b'submitted': b'1', b'errored': b'0', b'removed': b'0'
    }


async def test_submit_targets_server_error_once(app, redis, http_mock):
    odlc = Odlc()
    target = ('id', 5, 'image_id', 6, 'odlc', odlc.SerializeToString(),
              'submitted', 0, 'errored', 0, 'removed', 0)

    post_odlc = Odlc()
    post_odlc.id = 2

    await redis.sadd('all-targets', 5)
    await redis.lpush('unsubmitted-targets', 5)
    await redis.hmset('target:5', *target)

    http_mock.post('http://interop-proxy:1234/api/odlcs', status=500)
    http_mock.post('http://interop-proxy:1234/api/odlcs',
                   body=post_odlc.SerializeToString(),
                   headers={'Content-Type': 'application/x-protobuf'})

    await service.tasks.submit_targets(app)

    assert await get_int_set(redis, 'all-targets') == [5]
    assert await get_int_set(redis, 'submitted-targets') == [5]
    assert await get_int_set(redis, 'errored-targets') == []
    assert await get_int_set(redis, 'removed-targets') == []
    assert await get_int_list(redis, 'unsubmitted-targets') == []
    assert await get_int_list(redis, 'submitting-targets') == []
    assert await redis.hgetall('target:5') == {
        b'id': b'5', b'image_id': b'6', b'odlc': post_odlc.SerializeToString(),
        b'submitted': b'1', b'errored': b'0', b'removed': b'0'
    }


async def test_submit_targets_client_error(app, redis, http_mock):
    odlc = Odlc()
    target = ('id', 5, 'image_id', 6, 'odlc', odlc.SerializeToString(),
              'submitted', 0, 'errored', 0, 'removed', 0)

    await redis.sadd('all-targets', 5)
    await redis.lpush('unsubmitted-targets', 5)
    await redis.hmset('target:5', *target)

    http_mock.post('http://interop-proxy:1234/api/odlcs', status=400)

    await service.tasks.submit_targets(app)

    assert await get_int_set(redis, 'all-targets') == [5]
    assert await get_int_set(redis, 'submitted-targets') == []
    assert await get_int_set(redis, 'errored-targets') == [5]
    assert await get_int_set(redis, 'removed-targets') == []
    assert await get_int_list(redis, 'unsubmitted-targets') == []
    assert await get_int_list(redis, 'submitting-targets') == []
    assert await redis.hgetall('target:5') == {
        b'id': b'5', b'image_id': b'6', b'odlc': odlc.SerializeToString(),
        b'submitted': b'0', b'errored': b'1', b'removed': b'0'
    }


async def test_submit_targets_cancelled(app, redis, http_mock):
    odlc = Odlc()
    target = ('id', 5, 'image_id', 6, 'odlc', odlc.SerializeToString(),
              'submitted', 0, 'errored', 0, 'removed', 0)

    await redis.sadd('all-targets', 5)
    await redis.lpush('unsubmitted-targets', 5)
    await redis.lpush('unremoved-targets', 5)
    await redis.hmset('target:5', *target)

    await service.tasks.submit_targets(app)

    assert await get_int_set(redis, 'all-targets') == [5]
    assert await get_int_set(redis, 'submitted-targets') == []
    assert await get_int_set(redis, 'errored-targets') == []
    assert await get_int_set(redis, 'removed-targets') == [5]
    assert await get_int_list(redis, 'unsubmitted-targets') == []
    assert await get_int_list(redis, 'unremoved-targets') == []
    assert await get_int_list(redis, 'submitting-targets') == []
    assert await redis.hgetall('target:5') == {
        b'id': b'5', b'image_id': b'6', b'odlc': odlc.SerializeToString(),
        b'submitted': b'0', b'errored': b'0', b'removed': b'1'
    }


async def test_remove_targets(app, redis, http_mock):
    odlc = Odlc()
    odlc.id = 2
    odlc.type = Odlc.OFF_AXIS
    odlc.image = b'test-image'
    target = ('id', 5, 'image_id', 6, 'odlc', odlc.SerializeToString(),
              'submitted', 1, 'errored', 0, 'removed', 0)

    await redis.sadd('all-targets', 5)
    await redis.sadd('submitted-targets', 5)
    await redis.lpush('unremoved-targets', 5)
    await redis.hmset('target:5', *target)

    http_mock.delete('http://interop-proxy:1234/api/odlcs/2')

    await service.tasks.remove_targets(app)

    assert await get_int_set(redis, 'all-targets') == [5]
    assert await get_int_set(redis, 'submitted-targets') == [5]
    assert await get_int_set(redis, 'errored-targets') == []
    assert await get_int_set(redis, 'removed-targets') == [5]
    assert await get_int_list(redis, 'unremoved-targets') == []
    assert await get_int_list(redis, 'removing-targets') == []
    assert await redis.hgetall('target:5') == {
        b'id': b'5', b'image_id': b'6', b'odlc': odlc.SerializeToString(),
        b'submitted': b'1', b'errored': b'0', b'removed': b'1'
    }


async def test_remove_targets_already_removed(app, redis, http_mock):
    odlc = Odlc()
    odlc.id = 2
    odlc.type = Odlc.OFF_AXIS
    odlc.image = b'test-image'
    target = ('id', 5, 'image_id', 6, 'odlc', odlc.SerializeToString(),
              'submitted', 1, 'errored', 0, 'removed', 1)

    await redis.sadd('all-targets', 5)
    await redis.sadd('submitted-targets', 5)
    await redis.sadd('removed-targets', 5)
    await redis.lpush('unremoved-targets', 5)
    await redis.hmset('target:5', *target)

    http_mock.delete('http://interop-proxy:1234/api/odlcs/2')

    await service.tasks.remove_targets(app)

    assert await get_int_set(redis, 'all-targets') == [5]
    assert await get_int_set(redis, 'submitted-targets') == [5]
    assert await get_int_set(redis, 'errored-targets') == []
    assert await get_int_set(redis, 'removed-targets') == [5]
    assert await get_int_list(redis, 'unremoved-targets') == []
    assert await get_int_list(redis, 'removing-targets') == []
    assert await redis.hgetall('target:5') == {
        b'id': b'5', b'image_id': b'6', b'odlc': odlc.SerializeToString(),
        b'submitted': b'1', b'errored': b'0', b'removed': b'1'
    }


async def test_remove_targets_no_exist(app, redis, http_mock):
    # If something doesn't exist it shouldn't be removed.
    odlc = Odlc()
    odlc.id = 2
    odlc.type = Odlc.OFF_AXIS
    odlc.image = b'test-image'
    target = ('id', 5, 'image_id', 6, 'odlc', odlc.SerializeToString(),
              'submitted', 0, 'errored', 1, 'removed', 0)

    await redis.sadd('all-targets', 5)
    await redis.sadd('errored-targets', 5)
    await redis.lpush('unremoved-targets', 5)
    await redis.hmset('target:5', *target)

    http_mock.delete('http://interop-proxy:1234/api/odlcs/2', status=404)

    await service.tasks.remove_targets(app)

    assert await get_int_set(redis, 'all-targets') == [5]
    assert await get_int_set(redis, 'submitted-targets') == []
    assert await get_int_set(redis, 'errored-targets') == [5]
    assert await get_int_set(redis, 'removed-targets') == []
    assert await get_int_list(redis, 'unremoved-targets') == []
    assert await get_int_list(redis, 'removing-targets') == []
    assert await redis.hgetall('target:5') == {
        b'id': b'5', b'image_id': b'6', b'odlc': odlc.SerializeToString(),
        b'submitted': b'0', b'errored': b'1', b'removed': b'0'
    }


async def test_remove_targets_server_error(app, redis, http_mock):
    odlc = Odlc()
    odlc.id = 2
    odlc.type = Odlc.OFF_AXIS
    odlc.image = b'test-image'
    target = ('id', 5, 'image_id', 6, 'odlc', odlc.SerializeToString(),
              'submitted', 1, 'errored', 0, 'removed', 0)

    await redis.sadd('all-targets', 5)
    await redis.sadd('submitted-targets', 5)
    await redis.lpush('unremoved-targets', 5)
    await redis.hmset('target:5', *target)

    http_mock.delete('http://interop-proxy:1234/api/odlcs/2', status=500)
    http_mock.delete('http://interop-proxy:1234/api/odlcs/2')

    await service.tasks.remove_targets(app)

    assert await get_int_set(redis, 'all-targets') == [5]
    assert await get_int_set(redis, 'submitted-targets') == [5]
    assert await get_int_set(redis, 'errored-targets') == []
    assert await get_int_set(redis, 'removed-targets') == [5]
    assert await get_int_list(redis, 'unremoved-targets') == []
    assert await get_int_list(redis, 'removing-targets') == []
    assert await redis.hgetall('target:5') == {
        b'id': b'5', b'image_id': b'6', b'odlc': odlc.SerializeToString(),
        b'submitted': b'1', b'errored': b'0', b'removed': b'1'
    }


async def test_remove_targets_unsubmitted(app, redis, http_mock):
    odlc = Odlc()
    odlc.type = Odlc.OFF_AXIS
    odlc.image = b'test-image'
    target = ('id', 5, 'image_id', 6, 'odlc', odlc.SerializeToString(),
              'submitted', 0, 'errored', 0, 'removed', 0)

    await redis.sadd('all-targets', 5)
    await redis.lpush('unsubmitted-targets', 5)
    await redis.lpush('unremoved-targets', 5)
    await redis.hmset('target:5', *target)

    await service.tasks.remove_targets(app)

    assert await get_int_set(redis, 'all-targets') == [5]
    assert await get_int_set(redis, 'submitted-targets') == []
    assert await get_int_set(redis, 'errored-targets') == []
    assert await get_int_set(redis, 'removed-targets') == [5]
    assert await get_int_list(redis, 'unremoved-targets') == []
    assert await get_int_list(redis, 'removing-targets') == []
    assert await redis.hgetall('target:5') == {
        b'id': b'5', b'image_id': b'6', b'odlc': odlc.SerializeToString(),
        b'submitted': b'0', b'errored': b'0', b'removed': b'1'
    }
