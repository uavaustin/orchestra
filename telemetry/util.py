from contextlib import contextmanager
from math import fmod, pi
import signal
import time

from flask import make_response
from google.protobuf import json_format

from messages import telemetry_pb2


def meters_to_feet(meters):
    """Convert a number from meters to feet"""
    return meters * 3.280839895


def rad_to_deg(rad):
    """Convert a number from radians to degrees"""
    return rad * 180 / pi


def mod_deg(deg):
    """Make sure a reading of degrees is in [0, 360)"""
    return fmod(fmod(deg, 360) + 360, 360)


def mod_deg_2(deg):
    """Make sure a reading of degrees is in (-180, 180]"""
    return -mod_deg(-deg - 180) + 180


def all_exist(*args):
    """Return True if all elements are not None, otherwise False"""
    return all(i is not None for i in args)


def protobuf_resp(msg, accept):
    """Return a Flask response with a serialized protobuf

    Optionally, this can return a human-readable JSON response 
    instead.
    """

    resp = make_response()

    if accept is None or not accept.startswith('application/json'):
        resp.mimetype = 'application/x-protobuf'
        resp.set_data(msg.SerializeToString())
    else:
        resp.mimetype = 'application/json'
        resp.set_data(json_format.MessageToJson(msg))

    return resp


def get_commands(vehicle, timeout=30):
    """Gets the commands from a dronkeit vehicle synchonously.

    Also puts them in a protobuf message before returning.    
    """

    commands = vehicle.commands
    commands.download()
    commands.wait_ready(timeout=timeout)

    command_msg_list = []

    # Mapping the dronekit commands to the Command Protobuf message.
    for command in commands:
        command_msg_list.append(telemetry_pb2.RawMission.Command(
            target_system=command.target_system,
            target_component=command.target_component,
            seq=command.seq,
            frame=command.frame,
            command=command.command,
            param_1=command.param1,
            param_2=command.param2,
            param_3=command.param3,
            param_4=command.param4,
            param_5=command.x,
            param_6=command.y,
            param_7=command.z
        ))

    return telemetry_pb2.RawMission(
        time=time.time(),
        next=commands.next,
        commands=command_msg_list
    )


class TimeoutException(Exception):
    """Raised when time_limit() excedes time alloted."""
    pass


@contextmanager
def time_limit(seconds):
    """Context manager to limit the time a block can run.

    This is intended to be used with the with statement.

    Note that this will not work on Windows as it doesn't have SIGALRM
    """

    def raise_timeout(signum, frame):
        raise TimeoutException()

    # Raise SIGALRM in the provided amount of seconds. This will be
    # canceled if the block completes.
    signal.signal(signal.SIGALRM, raise_timeout)
    signal.alarm(seconds)

    try:
        yield
    finally:
        # This cancels the alarm.
        signal.alarm(0)
