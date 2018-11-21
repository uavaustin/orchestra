# Pong

Service that pings other services and records how long requests take to
process, round-trip.

## Environment Variables

- `SERVICE_TIMEOUT` - amount of time in ms until a request times out - defaults
  to 5000 ms.
- `PING_SERVICES` - list of services to ping in the form
  `name,host:port,endpoint` and separated by spaces. Port and endpoint are
  optional. The port defaults to `80` and endpoint to `/api/alive` if not
  specified.

  For example:
  `interop-server,172.16.238.11,/ telemetry,172.16.238.12:5000`
- `PING_DEVICES` - list of ip address to ping via ICMP ping in the form
  `name,host` and separated by spaces. Note that only direct ip addresses are
  accepted, e.g., `localhost` would not be acceptable.

  For example: `google-dns,8.8.8.8 some-container,172.17.0.2`

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
