import os.path

from aiohttp import web
import aiohttp_cors
from google.protobuf.json_format import MessageToJson
import socketio

routes = web.RouteTableDef()


@routes.get('/api/alive')
async def handle_alive(request):
    """Send back text as a sanity check."""
    return web.Response(text='Hi.\n')


@routes.get('/api/images/{id:\d+}/full')
async def handle_full_image(request):
    """Return back the original image proto."""
    # Fetching from imagery service.
    url = request.app['imagery_url'] + '/api/image/' + request.match_info['id']
    accept = request.headers.getone('accept', '')
    proto = await _get_url(request.app, url, accept=accept)
    return _proto_response(request, proto)


class WsNamespace(socketio.AsyncNamespace):    
    def __init__(self, namespace, app):
        super().__init__(namespace)
        self._app = app


def _proto_response(request, msg):
    """Return a protobuf wire or JSON response.

    If passing bytes, always return the wire format.
    """
    accept = request.headers.getone('accept', '')
    is_encoded = type(msg) == bytes

    if is_encoded or not accept.startswith('application/json'):
        body = msg.SerializeToString() if not is_encoded else msg
        return web.Response(body=body, content_type='application/x-protobuf')
    else:
        body = MessageToJson(msg)
        return web.json_response(body=body)


async def _get_url(app, url, accept='application/x-protobuf'):
    async with app['http_client'].get(url, headers={'accept': accept}) as resp:
        resp.raise_for_status()
        return await resp.read()


def create_app():
    """Create an aiohttp web application."""
    app = web.Application()
    app.on_startup.append(_add_ws)
    app.router.add_routes(routes)
    _add_cors(app)

    return app


async def _add_ws(app):
    # Seperate since we need the Redis URL for connecting for
    # socketio to sync image-rec-manual-api instances.
    sio = socketio.AsyncServer(
        async_mode='aiohttp',
        client_manager=socketio.AsyncRedisManager(app['redis_url'])
    )
    sio.register_namespace(WsNamespace('/', app))
    sio.attach(app)
    app['sio'] = sio


def _add_cors(app):
    # Configure default CORS settings.
    cors = aiohttp_cors.setup(app, defaults={
        '*': aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers='*',
            allow_headers='*',
        )
    })

    # Configure CORS on all routes (socket.io will not be handled as
    # it does it on its own).
    for route in list(app.router.routes()):
        cors.add(route)
