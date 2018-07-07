ARG BASE=alpine

FROM ${BASE}

RUN apk --no-cache add \
    protobuf \
    rust \
    cargo

# Installing the rust protobuf library so we can generate rust files
# as well.
RUN cargo install protobuf && \
    cp /root/.cargo/bin/protoc-gen-rust /usr/bin/
