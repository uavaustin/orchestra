from math import pi

from flask import make_response
from google.protobuf import json_format


def meters_to_feet(meters):
    """Convert a number from meters to feet"""
    return meters * 3.280839895


def rad_to_deg(rad):
    """Convert a number from radians to degrees"""
    return rad * 180 / pi


def mod_deg(deg):
    """Make sure a reading of degrees is between 0 and 360"""
    return (deg + 360) % 360


def all_exist(*args):
    """Return True if all elements are not None, otherwise False"""
    return all(i is not None for i in args)


def protobuf_resp(msg, json=False):
    """Return a Flask response with a serialized protobuf

    Optionally, this can return a human-readable JSON response 
    instead.
    """
    resp = make_response()

    if not json:
        resp.mimetype = 'application/x-protobuf'
        resp.set_data(msg.SerializeToString())
    else:
        resp.mimetype = 'application/json'
        resp.set_data(json_format.MessageToJson(msg))

    return resp
