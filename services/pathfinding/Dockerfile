ARG BASE=rust:1.23.0

FROM ${BASE} AS builder

WORKDIR /builder

COPY pathfinding .

RUN cargo build

ENV INTEROP_PROXY_URL='172.16.238.13:8000' \
    TELEMETRY_URL='172.16.238.12:5000'

EXPOSE 7500

CMD cargo run
