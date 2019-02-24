# Image Rec Master

Service that queues images and submits targets for the image recognition
pipeline on Redis.

See [`tasks.py`](service/tasks.py) for a description of how the images and
targets flow throughout the pipeline in this service and through other image
recognition pipeline services.

## Environment Variables

- `PORT` - defaults to `8082`.
- `IMAGERY_HOST` - defaults to `imagery`.
- `IMAGERY_PORT` - defaults to `8081`.
- `INTEROP_PROXY_HOST` - defaults to `interop-proxy`.
- `INTEROP_PROXY_PORT` - defaults to `8000`.
- `REDIS_HOST` - defaults to `redis`.
- `REDIS_PORT` - defaults to `6379`.

## Endpoints

To get JSON data for the Protobuf endpoints, pass in `application/json` for the
`Accept` header.

- `GET /api/alive`

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

- `GET /api/pipeline`

  Return the current image recognition pipeline state.

  On successful response: `200` status code with `image_rec::PipelineState`
  Protobuf message.

- `GET /api/pipeline/targets/:id`

  Return a target by id in the pipeline.

  `id` must be a nonnegative integer. Note that this is not the same as
  the _Odlc_ `id` given by the Interop Server.

  On successful response: `200` status code with `image_rec::Target` Protobuf
  message.

- `POST /api/pipeline/reset`

  Completely reset the pipeline.

  On successful response: `204` status code.

- `GET /api/pipeline/archive`

  Return a zip archive for backup target submission.

  From a browser, this will download an attachment `targets.zip`.

  On successful response: `200` status code with `application/zip`
  Content-Type.
