ARG BASE=python:3.7-alpine

# Compile the proto files and fetch pip dependencies.
FROM ${BASE} AS builder_backend

WORKDIR /builder

# gcc and musl-dev are required for the aioredis dependency.
RUN apk --no-cache add \
    gcc \
    musl-dev \
    protobuf

COPY common/python/requirements.txt common/requirements.txt
COPY image-rec-manual-api/requirements.txt .

RUN pip install -r common/requirements.txt -r requirements.txt

COPY common/messages/imagery.proto \
    common/messages/image_rec.proto \
    common/messages/interop.proto \
    common/messages/telemetry.proto \
    messages/

RUN mkdir dist && protoc --python_out=dist messages/*.proto

# Making the actual image now.
FROM ${BASE}

WORKDIR /app

# Copy the pip requirements and protobuf messages from above.
COPY --from=builder_backend /usr/local/lib/python3.7/site-packages \
                            /usr/local/lib/python3.7/site-packages
COPY --from=builder_backend /builder/dist/messages messages

COPY common/python common
COPY image-rec-manual-api/service service

ENV PORT='8083' \
    IMAGERY_HOST='imagery' \
    IMAGERY_PORT='8081' \
    INTEROP_PROXY_HOST='interop-proxy' \
    INTEROP_PROXY_PORT='8000' \
    IMAGE_REC_MASTER_HOST='image-rec-master' \
    IMAGE_REC_MASTER_PORT='8082' \
    REDIS_HOST='redis' \
    REDIS_PORT='6379'

ENV PYTHONUNBUFFERED=TRUE

EXPOSE 8083

CMD python -m service
