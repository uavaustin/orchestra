# This Dockerfile is built for ARM devices. Therefore, the packages are compiled
# during build.
ARG BASE_BUILDER=alpine:3.9
ARG BASE=uavaustin/hawk-eye-arm:0.0.1a

# Compile the proto files (using alpine for easy recent protoc
# install).
FROM ${BASE_BUILDER} AS builder

WORKDIR /builder

RUN apk --no-cache add \
    protobuf

COPY common/messages/image_rec.proto \
    common/messages/imagery.proto \
    common/messages/interop.proto \
    common/messages/telemetry.proto \
    messages/

RUN mkdir dist && protoc --python_out=dist messages/*.proto

# Making the actual image now
FROM ${BASE}

WORKDIR /app

RUN apt-get update && apt-get install -y \
    python3-dev \
    python3-pip \
    zlib1g-dev \
    libjpeg-dev 

RUN python3 -m pip install --upgrade pip 
RUN python3 -m pip install --upgrade setuptools wheel

COPY common/python/requirements.txt common/requirements.txt
COPY image-rec-auto/requirements.txt .

RUN python3 -m pip install  -r common/requirements.txt -r requirements.txt \
    -r /hawk_eye/inference/requirements.txt

# Install PyTorch
RUN wget https://nvidia.box.com/shared/static/9eptse6jyly1ggt9axbja2yrmj6pbarc.whl \
    -O  torch-1.6.0-cp36-cp36m-linux_aarch64.whl \
    && python3 -m pip install torch-1.6.0-cp36-cp36m-linux_aarch64.whl \
    && rm torch-1.6.0-cp36-cp36m-linux_aarch64.whl

# Copy the protobuf messages from above.
COPY --from=builder /builder/dist/messages messages

COPY common/python common
COPY image-rec-auto/service service

ENV IMAGERY_HOST='imagery' \
    IMAGERY_PORT='8081' \
    IMAGE_REC_MASTER_HOST='image-rec-master' \
    IMAGE_REC_MASTER_PORT='8082' \
    FETCH_INTERVAL='1000'

ENV PYTHONUNBUFFERED=TRUE

CMD python -m service
