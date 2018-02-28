ARG BASE=debian:stretch-slim

FROM ${BASE}

WORKDIR /builder

COPY protobuf-version.sh .
COPY install-protoc.sh .

RUN ./install-protoc.sh
