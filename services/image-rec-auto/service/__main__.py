import os
import sys

from common.logger import configure_logger

from . import Service


if __name__ == "__main__":
    configure_logger()

    service = Service(
        imagery_host=os.environ.get("IMAGERY_HOST"),
        imagery_port=int(os.environ.get("IMAGERY_PORT")),
        master_host=os.environ.get("IMAGE_REC_MASTER_HOST"),
        master_port=os.environ.get("IMAGE_REC_MASTER_PORT"),
        fetch_interval=int(os.environ.get("FETCH_INTERVAL")),
    )

    try:
        # Keep running an iteration of the service.
        while True:
            service.run_iter()

        # If the above finishes, an error occurred.
        sys.exit(1)
    except KeyboardInterrupt:
        sys.exit(0)
