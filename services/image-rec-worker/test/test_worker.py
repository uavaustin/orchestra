import os
import sys

import PIL.Image
import target_finder


# Putting the service path in the python path so we can import the
# worker.
service_dir = os.path.abspath(os.path.join(__file__, '..', '..'))
sys.path.append(service_dir)


import worker


def test_encode_odlc():
    odlc = (42.0, 'rectangle', 'red', 'B', 'blue', 12.34, -34.56, 'test-image')

    qs_1 = worker.encode_odlc(odlc)

    assert qs_1 == 'orientation=42.0&shape=rectangle&background_color=red&' \
            'alphanumeric=B&alphanumeric_color=blue&lat=12.34&lon=-34.56&' \
            'image='

    qs_2 = worker.encode_odlc(odlc, include_image=True)

    assert qs_2 == 'orientation=42.0&shape=rectangle&background_color=red&' \
            'alphanumeric=B&alphanumeric_color=blue&lat=12.34&lon=-34.56&' \
            'image=test-image'


def test_decode_odlc():
    qs_1 = 'orientation=43.0&shape=square&background_color=blue&' \
            'alphanumeric=A&alphanumeric_color=white&lat=-12.34&lon=34.56&' \
            'image='

    qs_2 = 'orientation=43.0&shape=square&background_color=blue&' \
            'alphanumeric=A&alphanumeric_color=white&lat=-12.34&lon=34.56&' \
            'image=test-image-2'

    odlc_1 = worker.decode_odlc(qs_1)

    assert odlc_1 == (
        43.0, 'square', 'blue', 'A', 'white', -12.34, 34.56, ''
    )

    odlc_2 = worker.decode_odlc(qs_2)

    assert odlc_2 == (
        43.0, 'square', 'blue', 'A', 'white', -12.34, 34.56, 'test-image-2'
    )
