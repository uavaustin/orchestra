"""Allows for manual target submission via a web UI."""

from aiohttp import ClientSession, web
import aioredis

from .app import create_app


class Service:
    def __init__(self, port, imagery_host, imagery_port, interop_host,
                 interop_port, master_host, master_port, redis_host,
                 redis_port):
        """Create a new image-rec-manual service."""
        self._port = port

        app = create_app()
        app['redis_url'] = f'redis://{redis_host}:{redis_port}'
        app['imagery_url'] = f'http://{imagery_host}:{imagery_port}'
        app['interop_url'] = f'http://{interop_host}:{interop_port}'
        app['master_url'] = f'http://{master_host}:{master_port}'

        self._app = app
        self._runner = web.AppRunner(self._app)

    async def start(self):
        """Start the service."""
        app = self._app
        runner = self._runner

        app['http_client'] = ClientSession(loop=app.loop)

        app['redis'] = await aioredis.create_redis_pool(
            app.get('redis_url'), minsize=5, maxsize=10, loop=app.loop
        )

        await runner.setup()
        site = web.TCPSite(runner, '0.0.0.0', self._port)
        await site.start()

    async def stop(self):
        """Stop the service."""
        app = self._app
        runner = self._runner

        await runner.cleanup()

        app['redis'].close()
        await app['redis'].wait_closed()

        await app['http_client'].close()
