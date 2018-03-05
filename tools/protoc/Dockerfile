ARG BASE=debian:stretch-slim
ARG BASE_RUST=rust:1.23.0

FROM ${BASE} AS builder

WORKDIR /builder

COPY protobuf-version.sh .
COPY install-protoc.sh .

RUN ./install-protoc.sh

# Copying over protoc and adding in the ability to make rust files as
# well.
FROM ${BASE_RUST}

WORKDIR /builder

RUN cargo install protobuf

COPY --from=builder /usr/local/bin/protoc /usr/local/bin/protoc
