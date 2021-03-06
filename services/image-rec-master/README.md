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
- `MAX_AUTO_TARGETS` - limits number of autonomous targets that can be
   submitted. If unset (the dafault) no cap will be used.

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

- `GET /api/pipeline/images/:id`

  Return an image by id in the pipeline.

  `id` must be a valid integer id from the imagery service.

  On successful response: `200` status code with `image_rec::PipelineImage`
  Protobuf message.

- `POST /api/pipeline/images/start-processing-next-auto`

  Start the processing window for the next auto image.

  The image is returned. Note that the processing must be finished or else the
  image will be treated as errored after enough time as passed.

  On successful response: `200` status code with `image_rec::PipelineImage`
  Protobuf message.

  If no image is available: `409` status code.

- `POST /api/pipeline/images/:id/finish-processing-auto`

  Mark the auto processing as finished for an image.

  `id` must be a valid integer id of an image being processed. The image is
  returned.

  On successful response: `200` status code with `image_rec::PipelineImage`
  Protobuf message.

  If the image is not being processed: `409` status code.

- `POST /api/pipeline/images/process-next-manual`

  Process the next manual image.

  The image is returned. Note that the processing is finished immediately and
  will be shown in the image returned.

  On successful response: `200` status code with `image_rec::PipelineImage`
  Protobuf message.

  If no image is available: `409` status code.

- `GET /api/pipeline/targets/:id`

  Return a target by id in the pipeline.

  `id` must be a nonnegative integer. Note that this is not the same as
  the _Odlc_ `id` given by the Interop Server.

  On successful response: `200` status code with `image_rec::PipelineTarget`
  Protobuf message.

- `POST /api/pipeline/targets`

  Create a new target in the pipeline.

  Note that the target will be queued for submission and will not be submitted
  instantly. Only the `odlc` and `image_id` fields will be read from the body.

  If an autonomous standard target is submitted which is similar to an existing
  autonomous standard target, the target will not post and the request will
  redirect.

  Body should be an `image_rec::PipelineTarget` Protobuf Message.

  On successful response: `201` status code with `image_rec::PipelineTarget`
  Protobuf message.

  On non-unique autonomous standard target: `303` status code with reference to
  matching target.

  On reaching maximum number of autonomous targets: `409` status code.

- `POST /api/pipeline/targets/:id/queue-removal`

  Create a target for removal.

  Note that the target will be queued for removal and will not be removed
  instantly. If the image is already in the removal pipeline, it will return
  a conflict. Once removed, the target will still exist for this service, but
  will only be removed from the interop server.

  On successful response: `204` status code with `image_rec::PipelineTarget`
  Protobuf message.

  On conflict: `409` status code.

- `POST /api/pipeline/reset`

  Completely reset the pipeline.

  On successful response: `204` status code.

- `GET /api/pipeline/archive`

  Return a zip archive for backup target submission.

  From a browser, this will download an attachment `targets.zip`.

  On successful response: `200` status code with `application/zip`
  Content-Type.
