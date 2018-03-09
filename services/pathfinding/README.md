# Pathfinding

Service that finds a path through obstacles

## Running the Image

```
$ docker run -it -p 7000:7000 \
    -e INTEROP_PROXY_URL="127.0.0.1:5000" \
    -e TELEMETRY_URL="127.0.0.1:8000" \
    uavaustin/pathfinding
```

## Endpoints

- `GET	/api/alive

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

- `POST /api/update_path`

  Calculate and update the current optimal path

  On successful response: `200` status code with `text/plain` Content-Type.
