ARG BASE=python:3.7-alpine

# Compile the proto files and fetch pip dependencies.
FROM ${BASE} AS builder

WORKDIR /builder

# gcc and musl-dev are required for the aioredis dependency.
RUN apk --no-cache add \
    gcc \
    musl-dev \
    protobuf

COPY image-rec-master/requirements.txt .

RUN pip install -r requirements.txt

COPY common/messages/imagery.proto \
    common/messages/image_rec.proto \
    common/messages/interop.proto \
    common/messages/telemetry.proto \
    messages/

RUN mkdir -p dist/messages && protoc -I=messages/ --python_out=dist/messages \
    messages/*.proto

# Making the actual image now.
FROM ${BASE}

WORKDIR /app

# Copy the pip requirements and protobuf messages from above.
COPY --from=builder /usr/local/lib/python3.7/site-packages \
                    /usr/local/lib/python3.7/site-packages
COPY --from=builder /builder/dist/messages .

COPY image-rec-master/service service

ENV PORT='8082' \
    IMAGERY_HOST='imagery' \
    IMAGERY_PORT='8081' \
    INTEROP_PROXY_HOST='interop-proxy' \
    INTEROP_PROXY_PORT='8000' \
    REDIS_HOST='redis' \
    REDIS_PORT='6379'

ENV PYTHONUNBUFFERED=TRUE

EXPOSE 8082

CMD python -m service
