ARG BASE=alpine

FROM ${BASE} AS builder

RUN apk --no-cache add \
    protobuf=3.4.1-r1 \
    rust \
    cargo

# Installing the rust protobuf library so we can generate rust files
# as well.
RUN cargo install protobuf --vers 1.4.3 && \
    cp /root/.cargo/bin/protoc-gen-rust /usr/bin/
