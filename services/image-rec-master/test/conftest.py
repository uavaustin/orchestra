"""Contains common fixtures for testing."""

import aioredis
import docker
import pytest


@pytest.fixture(scope='module')
def redis_container():
    """Starts up and stops a Redis instance.

    Intended to run just once for the duration of the tests.
    """
    client = docker.DockerClient(base_url='unix://var/run/docker.sock')
    api_client = docker.APIClient(base_url='unix://var/run/docker.sock')

    redis_container = client.containers.run('redis:alpine', remove=True,
                                            detach=True)
    inspect_dict = api_client.inspect_container(redis_container.name)
    ip = inspect_dict['NetworkSettings']['IPAddress']

    yield (ip, 6379)

    redis_container.kill()


@pytest.fixture
async def redis(redis_container):
    """Creates an aioredis instance for the Redis container."""
    redis = await aioredis.create_redis_pool(redis_container, minsize=5,
                                             maxsize=10)
    await redis.flushdb()

    yield redis

    redis.close()
    await redis.wait_closed()
