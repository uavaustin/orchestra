import io
import json
import zipfile

import interop_pb2


def create_archive(odlcs):
    """Create a backup zip file with targets.

    This is saved in the format that the interop server uses for
    backup target submissions. A JSON file with target metadata is
    expected to be accompanied with a image file with the same name
    (except the extention). The files are expected to be `1.json`,
    `1.jpg`, `2.json`, `2.jpg`, and so on.

    If there are no odlcs, then this will return None.
    """
    if len(odlcs) == 0:
        return None

    b = io.BytesIO()

    with zipfile.ZipFile(b, 'w') as backup:
        for num, odlc in enumerate(odlcs, start=1):
            encoded = json.dumps(_convert_odlc(odlc), indent=2)

            backup.writestr(f'{num}.json', encoded)
            backup.writestr(f'{num}.jpg', odlc.image)

    return b.getvalue()


# Convert an ODLC into a regular Python dictionary so it can be
# serialized as the JSON that the interop server expects.
def _convert_odlc(odlc):
    if odlc.type != interop_pb2.Odlc.EMERGENT:
        return _convert_standard_odlc(odlc)
    else:
        return _convert_emergent_odlc(odlc)


def _convert_standard_odlc(odlc):
    return {
        'type': _convert_type(odlc.type),
        'latitude': odlc.pos.lat,
        'longitude': odlc.pos.lon,
        'orientation': _convert_orientation(odlc.orientation),
        'shape': _convert_shape(odlc.shape),
        'background_color': _convert_color(odlc.background_color),
        'alphanumeric': odlc.alphanumeric or None,
        'alphanumeric_color': _convert_color(odlc.alphanumeric_color),
        'autonomous': odlc.autonomous
    }


def _convert_emergent_odlc(odlc):
    return {
        'type': _convert_type(odlc.type),
        'latitude': odlc.pos.lat,
        'longitude': odlc.pos.lon,
        'description': odlc.description,
        'autonomous': odlc.autonomous
    }


def _convert_type(type):
    return interop_pb2.Odlc.Type.Name(type).lower()


def _convert_orientation(orientation):
    orientation_map = {
        interop_pb2.Odlc.NORTH: 'n',
        interop_pb2.Odlc.NORTHEAST: 'ne',
        interop_pb2.Odlc.EAST: 'e',
        interop_pb2.Odlc.SOUTHEAST: 'se',
        interop_pb2.Odlc.SOUTH: 's',
        interop_pb2.Odlc.SOUTHWEST: 'sw',
        interop_pb2.Odlc.WEST: 'w',
        interop_pb2.Odlc.NORTHWEST: 'nw'
    }

    return orientation_map.get(orientation)


def _convert_shape(shape):
    if shape == interop_pb2.Odlc.UNKNOWN_SHAPE:
        return None
    else:
        return interop_pb2.Odlc.Shape(shape).lower()


def _convert_color(color):
    if color == interop_pb2.Odlc.UNKNOWN_COLOR:
        return None
    else:
        return interop_pb2.Odlc.Color(color).lower()
