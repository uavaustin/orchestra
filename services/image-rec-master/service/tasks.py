import asyncio

import aiohttp
import aioredis

import imagery_pb2
import interop_pb2

from .util import get_int_list, print_error


async def start_tasks(app):
    tasks = []
    tasks.append(_create_task(app, _queue_new))

    app['tasks'] = tasks


async def stop_tasks(app):
    for task in app['tasks']:
        task.cancel()


def _create_task(app, coro):
    async def wrapped(app):
        while True:
            try:
                await coro(app)
            except asyncio.CancelledError as e:
                raise e
            except Exception as e:
                print_error('unexpected error', str(e))
                await asyncio.sleep(0.5)

    return app.loop.create_task(wrapped(app))


async def _queue_new(app):
    try:
        available = await _get_available(app)

        await app['redis'].watch('all-images')

        all_ids = await app['redis'].smembers('all-images')
        ids = sorted(set(available) - set(all_ids))

        if len(ids) > 0:
            tr = app['redis'].multi_exec()
            tr.sadd('all-images', *ids)
            tr.lpush('unprocessed-auto', *ids)
            tr.lpush('unprocessed-manual', *ids)

            await tr.execute()
        else:
            await app['redis'].unwatch()
    except aioredis.MultiExecError:
        # Another instance updated the ids before our transaction
        # could complete.
        await asyncio.sleep(0.1)
    except aiohttp.ClientError as e:
        print_error('http error', str(e))
        await asyncio.sleep(0.5)
    except aioredis.RedisError as e:
        print_error('redis error', str(e))
        await asyncio.sleep(0.5)
    else:
        await asyncio.sleep(0.5)


async def _get_available(app):
    client = app['http_client']
    url = app['imagery_url']

    msg = imagery_pb2.AvailableImages()

    async with client.get(f'{url}/api/available') as resp:
        resp.raise_for_status()

        content = await resp.read()
        msg.ParseFromString(content)

    return msg.id_list
