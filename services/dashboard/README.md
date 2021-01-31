# Dashboard

Service that displays runtime statistics in a terminal dashboard.

## Running the Image

When running the image, you'll need to pass in the `FORWARD_INTEROP_URL` and
`PONG_URL` environment variables.

Example usage:

```
$ docker run -it \
    -e FORWARD_INTEROP_URL="192.168.0.5:4000" \
    -e PONG_URL="192.168.0.5:7000" \
    uavaustin/dashboard
```

## Attaching to the Service

This service can be run in the background and then attached to with Docker to
see the dashboard when desired.

To prevent stopping the dashboard service when stopping the `docker attach`
with Ctrl+C, do not make the service interative with the `-i` flag.

Only one terminal should be attached at a time.
