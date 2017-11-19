# This script will count how many telemetry records are in the AUVSI
# SUAS interop server.
#
# Note that this should be run inside the server container with 
# Python 2.

from __future__ import print_statement

import os
import sys


# Add server code to Python PATH for imports.
sys.path.append('/path/to/server')

# Add environment variable to get Django settings file.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server.settings')


from django.core.wsgi import get_wsgi_application


# Setting up Django
application = get_wsgi_application()


from auvsi_suas.models.uas_telemetry import UasTelemetry


# Printing out the telemetry count
print(len(UasTelemetry.objects.all()))
