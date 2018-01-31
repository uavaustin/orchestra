# Telemetry

Service that serves plane telemetry and mission data over a REST API.

## Known Problems

If the download mission action from dronekit times out, then new mission data
cannot be fetched. Unfortunately, this can happen quite often.

## Running the Image

The `CXN_STR` environment variable is used for connecting to the plane.
Optionally, the `CXN_TIMEOUT` and `CXN_RETRY` environment variables can set the
connection timeout time and whether or not to retry connecting on startup.

```
$ docker run -it -p 5000:5000 \
    -e CXN_STR=udpout:192.168.0.5:14550 \
    uavaustin/telemetry
```

## Endpoints

Note that all the Protobuf endpoints can also return JSON as well if the Accept
header is set to `application/json`.

- `GET /api/alive`

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

- `GET /api/interop-telem`

  Telemetry that can be forwarded to interop-proxy.

  On successful response: `200` status code with `interop::InteropTelem`
  Protobuf message.

- `GET /api/camera-telem`

  Camera telemetry for pinpointing image locations.

  On successful response: `200` status code with `telemetry::CameraTelem`
  Protobuf message.

  If any of the plane's lat, lon, alt, yaw, roll, pitch aren't loaded, an empty
  response with a `204` status code will be returned.

- `GET /api/raw-mission`

  Raw mission data from the plane.

  This pretty much maps directly with the mavlink mission messages.

  On successful response: `200` status code with `telemetry::RawMission`
  Protobuf message.
