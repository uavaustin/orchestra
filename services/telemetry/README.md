# Telemetry

Service that serves plane telemetry and mission data over a REST API.

## Notes

Note that concurrent mission transfers are not supported. If a mission is being
read or written to the plane when another request arrives, the next request is
queued afterwards. The behavior of two seperate telemetry services reading or
writing missions at the same time is undefined.

The plane telemetry source is expected to be UDP and mavlink v1.0 compliant.

## Environment Variables

- `PORT` - defaults to `5000`.
- `PLANE_HOST` - defaults to `mavproxy`.
- `PLANE_PORT` - defaults to `14550`.

## Endpoints

*Note that Protobuf endpoints can send and receive JSON when the Accept or
Content-Type header is `application/json`, respectively.*

If an error occurs, a `504` status code is returned if not enough data has been
received for the transaction to be completed.

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

- `GET /api/raw-mission`

  Raw mission data from the plane.

  This pretty much maps directly with the mavlink mission messages.

  On successful response: `200` status code with `telemetry::RawMission`
  Protobuf message.

- `POST /api/raw-mission`

  Pushes raw mission data to the plane, overwriting the previous mission.

  The request body must be a `telemetry::RawMission` Protobuf message.

  On successful response: `200` status code with an empty body.

- `GET /api/mission-current`

  Get the current mission item from the plane.

  If the current mission is not known, the mission is fetched as well.
  Otherwise, a cached value is returned.

  On successful response: `200` status code with `telemetry::MissionCurrent`
  Protobuf message.

- `POST /api/mission-current`

  Set the current mission item on the plane.

  The request body must be a `telemetry::MissionCurrent` Protobuf message.

  On successful response: `200` status code with an empty body.
