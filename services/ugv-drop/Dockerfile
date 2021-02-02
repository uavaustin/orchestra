# Compile the proto files and fetch pip dependencies.
FROM python:3.7-alpine AS builder

WORKDIR /builder

# gcc and musl-dev are required for the aioredis dependency.
RUN apk --no-cache add \
    gcc \
    musl-dev \
    protobuf

COPY common/python/requirements.txt common/requirements.txt
COPY ugv-drop/requirements.txt .

RUN pip install -r common/requirements.txt -r requirements.txt

COPY common/messages/imagery.proto \
    common/messages/image_rec.proto \
    common/messages/interop.proto \
    common/messages/telemetry.proto \
    messages/

RUN mkdir dist && protoc --python_out=dist messages/*.proto

# Making the actual image now.
FROM python:3.7-alpine

WORKDIR /app

# Copy the pip requirements and protobuf messages from above.
COPY --from=builder /usr/local/lib/python3.7/site-packages \
                    /usr/local/lib/python3.7/site-packages
COPY --from=builder /builder/dist/messages messages

COPY common/python common
COPY ugv-drop/service service

ENV IMAGERY_HOST='telemetry' \
    IMAGERY_PORT='5000' \
    INTEROP_PROXY_HOST='interop-proxy' \
    INTEROP_PROXY_PORT='8000' \
    ITER_INTERVAL='1000'

ENV PYTHONUNBUFFERED=TRUE

CMD python -m service
