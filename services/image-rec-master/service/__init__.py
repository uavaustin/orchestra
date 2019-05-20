"""Records new images for workers and uploads targets."""

import aiohttp
import aioredis

from .app import create_app


class Service:
    def __init__(self, port, imagery_host, imagery_port, interop_host,
                 interop_port, redis_host, redis_port, max_auto_targets):
        """Create a new image-rec-master service."""
        self._port = port

        app = create_app(
            f'redis://{redis_host}:{redis_port}',
            f'http://{imagery_host}:{imagery_port}',
            f'http://{interop_host}:{interop_port}',
            max_auto_targets
        )

        self._app = app
        self._runner = aiohttp.web.AppRunner(self._app)

    async def start(self):
        """Start the service."""
        app = self._app
        runner = self._runner

        app['http_client'] = aiohttp.ClientSession(loop=app.loop)

        app['redis'] = await aioredis.create_redis_pool(
            app.get('redis_url'), minsize=5, maxsize=10, loop=app.loop
        )

        await runner.setup()
        site = aiohttp.web.TCPSite(runner, '0.0.0.0', self._port)
        await site.start()

    async def stop(self):
        """Stop the service."""
        app = self._app
        runner = self._runner

        await runner.cleanup()

        app['redis'].close()
        await app['redis'].wait_closed()

        await app['http_client'].close()
