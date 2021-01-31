# Forward Interop

Service that sends required telemetry data to the AUVSI SUAS Interoperability
Server.

The service also hosts an API showing what the telemetry upload rate is.
Ideally, the rate should be near 5 Hz. The rates are shown in both a raw and
*filtered* form, where the filtered form shows how much *unique* telemetry has
been uploaded in the time.

## Environment Variables

- `PORT` - defaults to `4000`.
- `INTEROP_PROXY_HOST` - defaults to `interop-proxy`.
- `INTEROP_PROXY_PORT` - defaults to `8000`.
- `TELEMETRY_HOST` - defaults to `telemetry`.
- `TELEMETRY_PORT` - defaults to `5000`.

## Endpoints

*Note that Protobuf endpoints can send and receive JSON when the Accept or
Content-Type header is `application/json`, respectively.*

- `GET /api/alive`

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

- `GET /api/upload-rate`

  Lists the upload rate over the last 1 and 5 seconds, and also the same rates
  but filtered by if the telemetry is unique each time.

  On successful response: `200` status code with `stats::InteropUploadRate`
  Protobuf message.

  In order to get a JSON response instead, set the Accept header to
  `application/json`.
