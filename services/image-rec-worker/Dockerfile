# FIXME - This is very unfriendly to different architectures. It
#         works for now though. Tensorflow and opencv-python will not
#         not install right for ARM.

ARG BASE=python:3.6-slim

# Compile the proto files and fetch pip dependencies.
FROM ${BASE} AS builder

WORKDIR /builder

RUN apt-get update && apt-get install -y \
    curl \
    unzip

ENV PROTOC_BASE='https://github.com/google/protobuf/releases/download'
ENV PROTOC_VERSION='3.6.1'
ENV PROTOC_ARCHIVE="protoc-$PROTOC_VERSION-linux-x86_64.zip"
ENV PROTOC_URL="$PROTOC_BASE/v$PROTOC_VERSION/$PROTOC_ARCHIVE"

RUN curl -OL "$PROTOC_URL" && \
    unzip "$PROTOC_ARCHIVE" -d protoc && \
    mv protoc/bin/* /usr/local/bin/ && \
    mv protoc/include/* /usr/local/include/

COPY image-rec-worker/requirements.txt .

RUN pip install -r requirements.txt

COPY common/messages/imagery.proto \
    common/messages/interop.proto \
    common/messages/telemetry.proto \
    messages/

RUN mkdir -p dist/messages && protoc -I=messages/ --python_out=dist/messages \
    messages/*.proto

# Making the actual image now
FROM ${BASE}

WORKDIR /app

# Needed for OpenCV.
RUN apt-get update && apt-get install -y \
    libglib2.0-0

# Copy the pip requirements and protobuf messages from above.
COPY --from=builder /usr/local/lib/python3.6/site-packages \
                    /usr/local/lib/python3.6/site-packages
COPY --from=builder /builder/dist/messages .

COPY image-rec-worker/worker.py .

ENV IMAGERY_URL='0.0.0.0:8081' \
    REDIS_URL='0.0.0.0:6379'

ENV PYTHONUNBUFFERED=TRUE

CMD PYTHONPATH="${PYTHONPATH}:/app/messages" python worker.py
