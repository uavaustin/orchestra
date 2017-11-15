# First we'll use the protobuf image to compile telemetry protobufs
# for python
ARG BASE_PROTOBUF=uavaustin/protobuf
ARG BASE=python:3.6-slim

FROM ${BASE_PROTOBUF} AS builder

COPY common/messages/telemetry.proto messages/telemetry.proto

RUN mkdir /dist

RUN protoc -I="messages" --python_out="/dist" "messages/telemetry.proto"

# Making the actual image now
FROM ${BASE}

WORKDIR /app

# We need build-essential so we can install dronekit's dependencies
RUN apt-get update && apt-get install -y \
    build-essential

COPY telemetry/requirements.txt .

RUN pip install -r requirements.txt

COPY telemetry .

# Adding in the output from the builder above
COPY --from=builder /dist messages

# Setting the default dronekit connection options
ENV CXN_STR=0.0.0.0:14550 \
    BAUD_RATE=115200 \
    TIMEOUT=120

CMD FLASK_APP=telemetry.py flask run --host 0.0.0.0
