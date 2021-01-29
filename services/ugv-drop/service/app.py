#!/usr/bin/env python3

""" Service class for UGV Drop. """
import logging
import requests
import time
from common import logger

# I'm not sure exactly what inputs you need, see 
# services/messages/telemetry.proto for what inputs you want
# and then add it as an import from `messages.<module name>`
from messages.interop_pb2 import InteropMission
from messages.telemetry_pb2 import Overview, CameraTelem

class Service:
    def __init__(
        self,
        telem_host: str,
        telem_port: int,
        interop_host: str,
        interop_port: str,
        iter_interval: int
    ) -> None:
        """
            Creates a new UGV-Drop service based on environment variables.
        """

        # Ping this endpoint + `/api/overview` to get statistics about the plane.
        self.telem_url = f'http://{telem_host}:{telem_port}'
        self.iter_interval = iter_interval

        interop_url = f'http://{interop_host}:{interop_port}/api/mission'

        # Get the air drop location and other necessary information
        # from mission overview. Wait until online.
        sleep_time = iter_interval / 2000
        while True:
            try:
                res = requests.get(interop_url)
                if res.status_code != 200:
                    time.sleep(sleep_time)
                    
                    # Double sleep time so there is less congestion.
                    sleep_time *= 2
                else:
                    mission = InteropMission.FromString(res.content)

                    # Not sure how protobuf stores this information, may be tuple,
                    # may be list -- check documentation.
                    self.position = mission.air_drop_pos
                    break

            except requests.RequestException as e:
                logging.error(logger.format_error('request error', str(e)))

        def iterate(self) -> None:
            """
                Main loop to run. Add implementation here. Periodically
                poll for Overview + CameraTelem from telemetry.
            """
            pass






