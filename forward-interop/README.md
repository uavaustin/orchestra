# Forward Interop

Service that sends required telemetry data to the AUVSI SUAS Interoperability
Server.

The service also hosts an API showing what the telemetry upload rate is.
Ideally, the rate should be near 5 Hz. The rates are shown in both a raw and
*filtered* form, where the filtered form shows how much *unique* telemetry has
been uploaded in the time.

## Running the Image

When running the image, you'll need to pass in the `INTEROP_URL`, `USERNAME`,
`PASSWORD`, `TELEMETRY_URL` environment variables.

```
$ docker run -it -p 4000:4000 \
    -e INTEROP_URL="192.168.0.5:8000" \
    -e USERNAME="someuser" \
    -e PASSWORD="somepass" \
    -e TELEMETRY_URL="192.168.0.6:5000" \
    uavaustin/forward-interop
```

## Endpoints

- `GET /api/alive`

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

- `GET /api/upload-rate`

  Lists the upload rate over the last 1 and 5 seconds, and also the some rates
  but filtered by if the telemetry is unique each time.

  On successful response: `200` status code with `stats:InteropUploadRate`
  Protobuf message.

  In order to get a JSON response instead, set the Accept header to
  `application/json`.
