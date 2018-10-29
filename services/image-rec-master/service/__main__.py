import asyncio
import os
import sys

from . import Service


if __name__ == '__main__':
    service = Service(
        port=int(os.environ.get('PORT')),
        imagery_host=os.environ.get('IMAGERY_HOST'),
        imagery_port=int(os.environ.get('IMAGERY_PORT')),
        interop_host=os.environ.get('INTEROP_PROXY_HOST'),
        interop_port=os.environ.get('INTEROP_PROXY_PORT'),
        redis_host=os.environ.get('REDIS_HOST'),
        redis_port=int(os.environ.get('REDIS_PORT'))
    )

    loop = asyncio.get_event_loop()
    loop.create_task(service.start())

    try:
        loop.run_forever()

        # If the above finishes, an error occurred.
        sys.exit(1)
    except KeyboardInterrupt:
        loop.run_until_complete(service.stop())
        sys.exit(0)
