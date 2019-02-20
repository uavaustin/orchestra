"""Contains common fixtures for testing."""

import aioredis
import docker
import pytest


@pytest.fixture
async def redis():
    """Starts up and stops a redis instance with a client."""
    client = docker.DockerClient(base_url='unix://var/run/docker.sock')
    api_client = docker.APIClient(base_url='unix://var/run/docker.sock')

    redis_container = client.containers.run('redis:alpine', remove=True,
                                            detach=True)
    inspect_dict = api_client.inspect_container(redis_container.name)
    ip = inspect_dict['NetworkSettings']['IPAddress']

    redis = await aioredis.create_redis_pool((ip, 6379), minsize=5, maxsize=10)

    yield redis

    redis_container.kill()
    redis.close()
    await redis.wait_closed()
