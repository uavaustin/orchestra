# Pathfinding

Service that finds a path through obstacles

## Running the Image

```
$ docker run -it -p 7500:7500 \
    -e INTEROP_PROXY_URL="127.0.0.1:5000" \
    -e TELEMETRY_URL="127.0.0.1:8000" \
    uavaustin/pathfinding
```

## Endpoints

All the Protobuf endpoints can also return JSON as well if the Accept header is set to application/json.

- `GET	/api/alive`

  Returns some text as a sanity check.

  On successful response: `200` status code with `text/plain` Content-Type.

- `POST /api/update-path`

  Calculate and update the current optimal path

  On successful response: `200` status code with an empty body.

- `GET /api/pathfinder-telem`

  Returns the current configuration parameter of the pathfinder

  On successful response: `200` status code with `pathfinding/PathfinderParameter` Protobuf message.

- `POST /api/pathfinder-telem`

  Pushes new configuration parameter to the pathfinder

  The request body must be a `pathfinding::PathfinderParameter` Protobuf message.

  On successful response: `200` status code with an empty body.
