# Imagery

Services that takes photos and repeats imagery data.

The service has three backends which can be used:

- `gphoto2` (default)

  This backend takes images directly from a camera device passed in to the
  container. Running as priviledged will do this if it's hard to find which
  device is the camera. The gphoto2 dependency will autodetect the camera. If
  no camera, or two or more cameras are found, an error will be thrown.

  By default, the capture rate is set to take a photo every two seconds. To set
  a different interval, set the `CAPTURE_INTERVAL` environment variable. The
  interval is in milliseconds.

  To specify the telemetry service for tagging images, you can specify the
  `TELEMETRY_HOST` and `TELEMETRY_PORT` environment variables. These both
  default to `telemetry` and `5000`.

- `file`

  Monitors a file and watches for new JPG or PNG files to be added. You should
  mount the directory which new images are expected to go to (in the container
  this is `/opt/new-images`). *Make sure to move files into this direcotory
  instead of copying them.* If copying, it's possible that the backend will
  read the file before it is finished being written to.

- `sync`

  Syncs images from another imagery service. Note that the image id numbers may
  not completely line up with the other service. The `IMAGERY_SYNC_HOST` should
  be set to specify the imagery service to be synced from.

To see and access the images registered, you can mount the the imagery
directory on the host (`/opt/imagery`). If mounting an existing imagery folder
onto the container, the service will use the images in that folder.

## Environment Variables

- `PORT` - defaults to `8081`.
- `BACKEND` - defaults to `gphoto2`.
- `IMAGERY_SYNC_HOST` - required when using the `sync` backend.
- `IMAGERY_SYNC_PORT` - defaults to `8081`.
- `TELEMETRY_HOST` - used with the `gphoto2` backend, defaults to `telemetry`.
- `TELEMETRY_PORT` - defaults to `5000`.
- `CAPTURE_INTERVAL` - used with the `gphoto2` backend, defaults to `2000` ms.
- `MAX_IMAGES` - defaults to `0` (no limit).

## Endpoints

To get JSON data for the Protobuf endpoints, pass in `application/json` for the
`Accept` header.

- `GET /api/alive`

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

- `GET /api/count`

  Lists the number of images currently registered.

  ***In the future relying on the count to assume image ids may not be
  reliable. Use `GET /api/availble` to fetch the list.***

  On successful response: `200` status code with `imagery::ImageCount` Protobuf
  message.

- `GET /api/available`

  Lists available image ids.

  On successful response: `200` status code with `imagery::AvailableImages`
  Protobuf message.

- `GET /api/capture-rate`

  Gives the rate at which images are being captured.

  On successful response: `200` status code with `stats::ImageCaptureRate`
  Protobuf message.


- `GET /api/image/latest`

  Get the latest image registered.

  On successful response: `200` status code with `imagery::Image` Protobuf
  message.

- `GET /api/image/next`

  Get the next image that is registered.

  Note that if no further images are added, this will simply timeout
  eventually.

  Useful for live-streaming images.

  On successful response: `200` status code with `imagery::Image` Protobuf
  message.

- `GET /api/image/:id`

  Get an image by an id.

  Id numbers start at zero. See `GET /api/count` to see how many images there
  are before requesting.

  On successful response: `200` status code with `imagery::Image` Protobuf
  message.
