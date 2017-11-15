import os
import time

import dronekit
from flask import Flask, jsonify, request

from messages import telemetry_pb2
from util import all_exist, meters_to_feet, mod_deg, protobuf_resp, rad_to_deg


cxn_str = os.environ['CXN_STR']
baud_rate = os.environ['BAUD_RATE']
timeout = os.environ['TIMEOUT']

# We'll connect to the plane before we serve the endpoints
print('Connecting to ' + cxn_str + '.')

vehicle = dronekit.connect(cxn_str, baud=baud_rate, heartbeat_timeout=timeout,
        wait_ready=True)

print('Connection successful.')

app = Flask(__name__)


@app.route('/api/time')
def get_time():
    """Gets the time since epoch in seconds"""
    msg = telemetry_pb2.Time(time=time.time())

    return protobuf_resp(msg, json=request.args.get('json') == 'true')


@app.route('/api/interop-telem')
def get_interop_telem():
    """Get the lat, lon, alt_msl, yaw of the plane"""
    loc = vehicle.location.global_frame
    attitude = vehicle.attitude

    lat = loc.lat
    lon = loc.lon
    alt_msl = loc.alt
    yaw = attitude.yaw

    # This telemetry is only useful if it's all here
    if (not all_exist(lat, lon, alt_msl, yaw)):
        return '', 204

    msg = telemetry_pb2.InteropTelem(
        time=time.time(),
        lat=lat,
        lon=lon,
        alt_feet_msl=meters_to_feet(alt_msl),
        yaw=yaw
    )

    return protobuf_resp(msg, json=request.args.get('json') == 'true')


@app.route('/api/camera-telem')
def get_camera_telem():
    """Get the lat, lon, alt, yaw, pitch, roll of the camera"""
    loc = vehicle.location.global_relative_frame
    attitude = vehicle.attitude
    gimbal = vehicle.gimbal

    # Getting values from the above. Note that we do not use the
    # gimbal yaw, since historically, we've never used a camera
    # gimbal that twists.
    lat = loc.lat
    lon = loc.lon
    alt = loc.alt
    yaw = attitude.yaw
    p_pitch = attitude.pitch
    p_roll = attitude.roll
    g_pitch = gimbal.pitch
    g_roll = gimbal.roll

    # This telemetry is only useful if it's all here
    if (not all_exist(lat, lon, alt, yaw, p_pitch, p_roll, g_pitch, g_roll)):
        return '', 204

    pitch = mod_deg(rad_to_deg(p_pitch) + g_pitch)
    roll = mod_deg(rad_to_deg(-p_roll) + g_roll)

    msg = telemetry_pb2.CameraTelem(
        time=time.time(),
        lat=lat,
        lon=lon,
        alt=alt,
        yaw=yaw,
        pitch=pitch,
        roll=roll
    )

    return protobuf_resp(msg, json=request.args.get('json') == 'true')


@app.route('/api/alive')
def get_alive():
    """Sanity check to make sure the rest server is up"""
    return 'yes, I\'m alive'
