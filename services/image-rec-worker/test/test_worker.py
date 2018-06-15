import os
import sys

import PIL.Image
import target_finder

# Putting the service path in the python path so we can import the
# worker.
service_dir = os.path.abspath(os.path.join(__file__, '..', '..'))
sys.path.append(service_dir)

import worker

import interop_pb2

def test_parse_targets_1():
    tf_targets = [
        target_finder.Target(
            10,
            20,
            100,
            500,
            target_finder.Shape.PENTAGON,
            95.3,
            target_finder.Color.RED,
            'G',
            target_finder.Color.BLUE,
            None,
            0.0
        )
    ]

    odlcs = worker.parse_targets(None, tf_targets)

    assert len(odlcs) == 1

    odlc = odlcs[0]

    assert odlc.type == interop_pb2.Odlc.STANDARD
    assert odlc.pos.lat == 0.0
    assert odlc.pos.lon == 0.0
    assert odlc.shape == interop_pb2.Odlc.PENTAGON
    assert odlc.orientation == interop_pb2.Odlc.EAST
    assert odlc.background_color == interop_pb2.Odlc.RED
    assert odlc.alphanumeric == 'G'
    assert odlc.alphanumeric_color == interop_pb2.Odlc.BLUE
    assert odlc.autonomous == True
    assert odlc.image == b''
