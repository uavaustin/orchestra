import asyncio
import os
import sys

from common.logger import configure_logger

from . import Service


if __name__ == '__main__':
    configure_logger()

    service = Service(
        port=int(os.environ.get('PORT')),
        imagery_host=os.environ.get('IMAGERY_HOST'),
        imagery_port=int(os.environ.get('IMAGERY_PORT')),
        interop_host=os.environ.get('IMAGE_REC_MASTER_HOST'),
        interop_port=int(os.environ.get('IMAGE_REC_MASTER_PORT')),
        master_host=os.environ.get('IMAGE_REC_MASTER_HOST'),
        master_port=int(os.environ.get('IMAGE_REC_MASTER_PORT')),
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
