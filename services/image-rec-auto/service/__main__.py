import asyncio
import os
import sys

from common.logger import configure_logger

from . import Service


if __name__ == '__main__':
    configure_logger()

    service = new Service(
        port=int(os.environ.get('PORT'))
    )

    loop = asyncio.get_event_loop()
    loop.create_task(service.start())

    try:
        loop.run_forever()

        sys.exit(1)
    except KeyboardInterrupt:
        loop.run_until_complete(service.stop())
        sys.exit(0)
