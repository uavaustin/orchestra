import os
import time

import dronekit
from flask import Flask


cxn_str = os.environ['CXN_STR']
baud_rate = os.environ['BAUD_RATE']
timeout = os.environ['TIMEOUT']

print('Connecting to ' + cxn_str + '.')

vehicle = dronekit.connect(cxn_str, baud=baud_rate, heartbeat_timeout=timeout,
        wait_ready=True)

print('Connection successful.')

app = Flask(__name__)


@app.route('/time')
def get_time():
    """Gets the time since epoch in seconds"""
    return str(time.time())
