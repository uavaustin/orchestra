# Configuration Files

Docker Compose + other miscellaneous files for our devices.

Currently, we've got:

```bash
├── ground
│   ├── 37-3dr.rules        # udev rule for the 3DR (/dev/)
│   ├── 38-rfd900.rules     # udev rule for the RFD900 (/dev/)
│   └── docker-compose.yml  # Compose file for the ground server (portainer, mavproxy, telemetry, interop-proxy, pong, forward-interop, dashboard, imagery)
├── plane
│   ├── 51-pixhawk.rules    # udev rule for the Pixhawk (USB FTDI) (/dev/pixhawk)
│   ├── docker-compose.yml  # Compose file for the plane's computer (mavproxy, telemetry, imagery)
│   └── interfaces          # Network config that sets up a bridge for the camera (usb2)

```

udev rules go in `/etc/udev/rules.d`; after you copy the files over, run `udevadm control --reload-rules && udevadm trigger` to reload the rules.

`interfaces` should go in `/etc/network/interfaces`.

`docker-compose -f <compose config file> up` for Docker Compose files.