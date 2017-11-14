import time

import dronekit
from flask import Flask


app = Flask(__name__)


@app.route('/time')
def get_time():
    """Gets the time since epoch in seconds"""
    return str(time.time())
