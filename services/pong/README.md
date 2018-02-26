# Pong

Service that pings other services and records how long requests take to
process, round-trip.

## Running the Image

To ping the services, the service names, host, and port are simply passed as
command-line arguments seperated by a comma. Optionally, the endpoint that is
called can be set as well (defaults to `/api/alive`).

```
$ docker run -it -p 7000:7000 uavaustin/pong \
    some-service,192.168.0.3 \
    another-service,192.168.0.4 \
    interop-server,10.10.130.10:8080,/
```

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
