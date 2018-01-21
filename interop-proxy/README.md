# Interop Proxy

Service that wraps the the AUVSI SUAS Interoperability Server with Protobuf
responses along other things.

This keeps a login state so that other services do not need to authenticate
with the server.

## Running the Image

When running the image, make sure to pass in the `INTEROP_URL`, `USERNAME`, and
`PASSWORD` envrionment variables. They default to `0.0.0.0:8080`, `testuser`,
and `testpass`, respectively.

```
$ docker run -it -p 8000:8000 \
    -e INTEROP_URL="192.168.0.5:8080" \
    -e USERNAME="someuser" \
    -e PASSWORD="somepass" \
    uavaustin/interop-proxy
```

## Endpoints

Note that all the endpoints can send and receive JSON as well (with the same
structure as the Protobuf messages when the Accept or Content-Type header is
`application/json`, respectively).

When a image is being sent through JSON, they should be base64 encoded.

If the interop server could not be reached, a `503` status code will be sent.

- `GET /api/alive`

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

- `GET /api/mission`

  Lists the active mission on the server.

  Note that if there isn't an active mession, the reply will have all defaults
  and `current_mission` will be set to `false`.

  On successful response: `200` status code with `interop::Mission` Protobuf
  message.

- `GET /api/obstacles`

  Lists the stationary and moving obstacles on the server.

  On successful response: `200` status code with `interop::Obstacles` Protobuf
  message.

- `POST /api/telemetry`

  Post new telemetry to the server.

  Note that the telemetry should be send it metric units (it will be converted
  when being forwarded to the interop server).

  Body should be a `interop::InteropTelem` Protobuf message.

  On successful response: `200` status code with `interop::InteropMessage`
  Protobuf message.

- `GET /api/odlcs`

  Lists all the odlcs on the server.

  Pass a `"image"` param of `"1"` or `"true"` to get images as well.

  On successful response: `200` status code with `interop::OdlcList` Protobuf
  message.

- `GET /api/odlcs/:id`

  Get an odlc on the server by id.

  Pass a `"image"` param of `"1"` or `"true"` to get the image as well.

  On successful response: `200` status code with `interop::Odlc` Protobuf
  message.

- `POST /api/odlcs`

  Post a new odlc to the server.

  Note that images can also be uploaded at the same time.

  Body should be a `interop::Odlc` Protobuf message.

  On successful response: `200` status code with `interop::Odlc` Protobuf
  message (images will always be returned as empty strings).

- `PUT /api/odlcs/:id`

  Update an odlc on the server.

  Note that images can also be uploaded at the same time and unlike the
  interop server, this endpoint will replace all the contents of the odlc
  (except the image won't be deleted if an empty string is passed).

  Body should be a `interop::Odlc` Protobuf message.

  On successful response: `200` status code with `interop::Odlc` Protobuf
  message (images will always be returned as empty strings).

- `DELETE /api/odlcs/:id`

  Delete an odlc from the server.

  On successful response: `200` status code with `interop::InteropMessage`
  Protobuf message.

## Testing

The tests can either be run on the host machine or in a Docker container.

### Testing on the host machine

Make sure an interop server is being run on port 8080 and you'll need to have
the Elixir programming language installed on your machine.

```
# Getting hex and rebar3
$ mix local.hex --force && mix local.rebar --force

# Getting the dependencies
$ mix deps.get

# Copy the messages over (this is done for you when building the containers)
$ cp -R ../common/messages lib/

# Running the tests with mix
$ mix test
```

### Testing with a Docker container

Simply run `make test` in this directory to the run the tests with this. Note
that this process is a bit slower than the above for debugging.
