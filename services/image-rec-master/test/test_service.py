import asyncio
from unittest.mock import patch

from service import Service


async def test_start_stop(redis_container):
    redis_host, redis_port = redis_container

    with patch('service.tasks.queue_new_images') as task_1, \
            patch('service.tasks.requeue_auto_images') as task_2, \
            patch('service.tasks.submit_targets') as task_3, \
            patch('service.tasks.remove_targets') as task_4:
        f = asyncio.Future()
        f.set_result(None)
        task_1.return_value = f
        task_2.return_value = f
        task_3.return_value = f
        task_4.return_value = f

        service = Service(
            port=1234,
            imagery_host='imagery',
            imagery_port=1234,
            interop_host='interop-proxy',
            interop_port=1234,
            redis_host=redis_host,
            redis_port=redis_port
        )

        # Stop and stop, give enough time for tasks to start.
        await service.start()
        await asyncio.sleep(0.1)
        await service.stop()

        # Make sure mocked tasks were started.
        assert task_1.called
        assert task_2.called
        assert task_3.called
        assert task_4.called
