"""Automatic image recognition driver."""

import aiohtpp

from .app import create_app


class Service:
    def __init__(self, port):
        """Create a new auto image rec service."""
        self._port = port

        app = create_app(
            # stuff
        )

        self._app = app
        self._runner = aiohttp.web.AppRunner(self._app)

    async def start(self):
        """Start the service."""
        app = self._app
        runner = self._runner

        app['http_client'] = aiohttp.ClientSession(loop=app.loop)

        await runner.setup()
        site = aiohttp.web.TCPSite(runner, '0.0.0.0', self._port)
        await site.start()

    async def stop(self):
        """Stop the service."""
        app = self._app
        runner = self._runner

        await runner.cleanup()

        await app['http_client'].close()
