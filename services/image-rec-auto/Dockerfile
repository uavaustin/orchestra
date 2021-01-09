ARG BASE_BUILDER=alpine:3.9
ARG BASE

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
    wget

RUN wget https://bootstrap.pypa.io/get-pip.py -O get-pip.py && python3 get-pip.py
RUN python3 -m pip install --upgrade pip

ARG install_pytorch
RUN if [ -n "$install_pytorch" ] ; then \
        python3 -m pip install torch==1.7.1+cpu torchvision==0.8.2+cpu -f https://download.pytorch.org/whl/torch_stable.html; \
    fi

COPY common/python/requirements.txt common/requirements.txt
COPY image-rec-auto/requirements.txt .

RUN python3 -m pip install  -r common/requirements.txt \
    -r requirements.txt

ARG HAWK_EYE_VERSION
RUN wget https://github.com/uavaustin/hawk-eye/releases/download/v${HAWK_EYE_VERSION}/hawk_eye-${HAWK_EYE_VERSION}-py3-none-any.whl \
    -O hawk_eye-${HAWK_EYE_VERSION}-py3-none-any.whl \
    && python3 -m pip install hawk_eye-${HAWK_EYE_VERSION}-py3-none-any.whl \
    && rm hawk_eye-${HAWK_EYE_VERSION}-py3-none-any.whl

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

CMD python3 -m service
