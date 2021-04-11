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
# ugv imports here
import UGV-Drop


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
                    logging.info(f'received unexpected status code: {res.status_code}.')
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

""" Under Construction """





@routes.get('/api/kinematics')
async def updates(request):
    """Updates location, velocity, and acceleration and other properties"""

    #initialize telemetry data
    lati = Position.lat
    long = Position.lon
    alti = Overview.alt
    velX = Velocity.x
    velY = Velocity.y
    velZ = Velocity.z
    acclX = 0
    acclY = -9.81
    acclZ = 0
    #need to include readings for acceleration in telemetry

    positCords = geoCord(lati, long, alti)
    velVector = vector(velX, velY, velZ)
    accelVector = vector(acclX, acclY, acclZ)
    """ still need readings for these as well

    origin = geoCord()
    drag = float()
    systemMass = float()
    chuteArea = float()
    deployTime = float()

    """
    #Updates properties of the plane for our UGVDropCalculator

    updates = dropCalculations(velVector, accelVector, positCords, origin, drag, systemMass, chuteArea, deployTime)
    updates.updateLocation()
    updates.updateVelocity()
    updates.updateAcceleration()
    updates.updateAirDensity()
    updates.updateChuteDepTime()

    #Updates our initialized variables
    velX = updates.vX
    velY = updates.vY
    velZ = updates.vZ

    acclX = updates.aX
    acclY = updates.aY
    acclZ = updates.aZ

return _proto_response(request, msg)


@routes.get('/api/projectilelocation')
async def handle_alive(request):
    """Send back text as a sanity check."""
    return web.Response(text='Wazzup?\n')






@routes.get('/api/droplocation')
async def get_drop_location(request):
    """Return the drop location"""
    tr = request.app['redis'].multi_exec()

#This is just for reference and does NOT apply for our service 
'''
    def get_set(key):
        tr.smembers(key)

    def get_list(key):
        tr.lrange(key, 0, -1)

    # All registered images.
    get_set('all-images')

    # Auto image rec state.
    get_list('unprocessed-auto')
    get_list('processing-auto')
    get_set('processed-auto')
    get_set('retrying-auto')
    get_set('errored-auto')
    get_set('skipped-auto')

    # Manual image rec state.
    get_list('unprocessed-manual')
    get_set('processed-manual')
    get_set('skipped-manual')

    # Target submission state.
    get_set('all-targets')
    get_list('unsubmitted-targets')
    get_list('submitting-targets')
    get_set('submitted-targets')
    get_set('errored-targets')
    get_list('unremoved-targets')
    get_list('removing-targets')
    get_set('removed-targets')

    data_str = await tr.execute()

    msg = PipelineState()
    msg.time = time()

    fields = [
        msg.all_images,
        msg.unprocessed_auto,
        msg.processing_auto,
        msg.processed_auto,
        msg.retrying_auto,
        msg.errored_auto,
        msg.skipped_auto,
        msg.unprocessed_manual,
        msg.processed_manual,
        msg.skipped_manual,
        msg.all_targets,
        msg.unsubmitted_targets,
        msg.submitting_targets,
        msg.submitted_targets,
        msg.errored_targets,
        msg.unremoved_targets,
        msg.removing_targets,
        msg.removed_targets
    ]

    # Convert the string lists to integer lists and add them to the
    # proto message.
    for field, str_list in zip(fields, data_str):
        field.extend([int(id_str) for id_str in str_list])
        field.sort()
'''

    return _proto_response(request, msg)
