#!/usr/bin/env python3

""" Runner file for testing. """


import os
import sys

from common import configure_logger

from . import Service

def main() -> None:
    service = Service(
        telem_host=os.environ.get('TELEM_HOST'),
        telem_port=int(os.environ.get('TELEM_PORT')),
        interop_host=os.environ.get('INTEROP_PROXY_HOST'),
        interop_port=int(os.environ.get('INTEROP_PROXY_PORT')),
        iter_interval=int(os.environ.get('ITER_INTERVAL'))
    )

    # Run main loop
    try:
        while True:
            service.iterate()

        # Should never exit here, error.
        sys.exit(1)
    except KeyboardInterrupt:
        sys.exit(0)

if __name__ == '__main__':
    configure_logger()
    main()
