ARG BASE=rust:1.23.0

FROM ${BASE}

WORKDIR /app

# Making a blank project so we can get the dependencies only so we
# can use the docker cache.
RUN USER=root cargo init

COPY pathfinding/Cargo.toml .

RUN cargo build --release

COPY pathfinding .

# Building our source, minus the dependencies.
RUN cargo build --release

ENV INTEROP_PROXY_URL='172.16.238.13:8000' \
    TELEMETRY_URL='172.16.238.12:5000'

EXPOSE 7500

CMD cargo run
