import asyncio
from aiohttp import Web


routes = web.RouteTableDef()


def _start_tasks():
    pass


def _stop_tasks():
    pass


def create_app(redis_url, imagery_url, interop_url, max_auto_targets):
    """Create an aiohttp web application."""
    app = web.Application()
    app.on_startup.append(_start_tasks)
    app.on_shutdown.append(_stop_tasks)
    app.router.add_routes(routes)

    app['image_rec_master_url'] = image_rec_master_url

    return app