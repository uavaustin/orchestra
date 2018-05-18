# Imagery

Service that hosts either gathers images or repeats imagery data.

The service has three backends which can be used:

- `camera` (default)

  This backend takes images directly from a camera device passed in to the
  container. Running as priviledged will do this if it's hard to find which
  device is the camera. The gphoto2 dependency will autodetect the camera. If
  no camera, or two or more cameras are found, an error will be thrown.

  By default, the capture rate is set to take a photo every two seconds. To set
  a different interval, set the `CAPTURE_INTERVAL` environment variable.

- `file`

  Monitors a file and watches for new PNG files to be added.

- `sync`

  Syncs images from another imagery service. Note that the image id numbers may
  not line up with the other service if the syncing service is started with
  existing images.

If mounting an existing imagery folder onto the container, the service will use
the images in that folder.

Note that no telemetry data is gathered for images at the current time.

## Running the Image

The `BACKEND` environment variable should be set to one of `camera`, `file`, or
`sync`.

If using `camera`, the `CAPTURE_INTERVAL` environment variable can be set to
set the rate at which images are taken in seconds. This defaults to every two
seconds.

If using `sync`, the `IMAGERY_SYNC_URL` should be set to the imagery service to
be synced from.

If using `file`, you should mount the directory which new images are expected
to go to (`/opt/new-images`).

To see and access the images registered, you can mount the the imagery
directory on the host (`/opt/imagery`).

Here's an example of using the camera backend (camera required to use) and
mounting the imagery directory on the host computer:

```
$ docker run -it -p 8081:8081 \
    --privileged
    -e BACKEND=camera
    -e CAPTURE_INTERVAL=2.5
    -v '$HOME/Desktop/imagery:/opt/imagery'
    uavaustin/forward-interop
```

## Endpoints

To get JSON data for the Protobuf endpoints, pass in `application/json` for the
`Accept` header.

- `GET /api/alive`

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

- `GET /api/count`

  Lists the number of images currently registered.

  On successful response: `200` status code with `imagery::ImageCount` Protobuf
  message.

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
