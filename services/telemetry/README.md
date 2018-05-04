# Telemetry

Service that serves plane telemetry and mission data over a REST API.

## Known Problems

It is not safe to transact with the plane concurrently with other applications.
This should be the only application directly writing to the plane.

## Running the Image

The `CXN_STR` environment variable is used for connecting to the plane.

```
$ docker run -it -p 5000:5000 \
    -e CXN_STR=udpout:192.168.0.5:14550 \
    uavaustin/telemetry
```

## Endpoints

Note that all the Protobuf endpoints can also return JSON as well if the Accept
header is set to `application/json`.

All requests long-poll until a connection to the plane has been established.
If an error occurs, a `504` status code is returned, or `503` if not enough
information has been captured from the plane at request time.

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

- `GET /api/overview`

  An overview of all of the plane's last known values.

  On successful response: `200` status code with `telemetry::Overview`
  Protobuf message.

  If information currently unavailable: `503` status code with an empty body.

- `GET /api/mission`

  JSON mission data from the plane parsed by the MAVLink library.

  Very similar to `/api/raw-mission`.

  On successful response: `200` status code with JSON data.
  On failure: `504` status code with a JSON field called `err` stating
  an error reason.

- `GET /api/raw-mission`

  Raw mission data from the plane.

  This pretty much maps directly with the mavlink mission messages.

  On successful response: `200` status code with `telemetry::RawMission`
  Protobuf message.

- `POST /api/raw-mission`

  Pushes raw mission data to the plane, overwriting the previous mission.

  The request body must be a `telemetry::RawMission` Protobuf message.

  On successful response: `200` status code with an empty body.
