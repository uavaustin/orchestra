# Pong

Service that pings other services and records how long requests take to
process, round-trip.

## Environment Variables

- `SERVICE_TIMEOUT` - amount of time in ms until a request times out - defaults
  to 5000 ms.
- `PING_SERVICES` - list of services to ping in the form
  `name,host:port,endpoint` and separated by spaces. Port and endpoint are
  optional.

  For example:
  `some-service,192.168.0.3 another-one,interop:1234,/endpoint`

## Endpoints

- `GET /api/alive`

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

- `GET /api/ping`

  Lists the ping values of the services passed on the command-line.

  On successful response: `200` status code with `stats::PingTimes` Protobuf
  message.

  In order to get a JSON response instead, set the Accept header to
  `application/json`.
