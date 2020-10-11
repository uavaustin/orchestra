# Tanstar

Work-in-progress service for autopilot.

## Environment Variables

- `SERVICE_TIMEOUT` - amount of time in ms until a request times out - defaults
  to 5000 ms.
- `PORT` - the port to listen on

## Endpoints

- `GET /api/alive`

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

## Notes

To get the service up and running:
```
$ make image #  Image will be tagged as uavaustin/tanstar
$ docker run -p 8765:8765 # Maps port 8765 on the container to the host machine
```

Note that a lot of functionality is currently missing:
1. No unit tests have been written yet, running `make test` won't work.
2. Dockerfile is incomplete (not a multistage build) but has passing functionality.
3. Eslint and Babel have not yet been integrated (although their configuration
files are in this directory). In order to still use ES6 import statements, an
extra dependency -- esm -- has been added along with a script in package.json.
These need to removed for production in the future.
