ARG BASE=python:3.6-slim

FROM ${BASE}

WORKDIR /app

# We need build-essential so we can install dronekit's dependencies
RUN apt-get update && apt-get install -y \
    build-essential

COPY telemetry/requirements.txt .

RUN pip install -r requirements.txt

COPY telemetry .

# Setting the default dronekit connection string and baud rate as
# well as the maximum time dronekit can fully establish its
# connection and whether it should retry connecting
ENV CXN_STR=0.0.0.0:14550 \
    BAUD_RATE=115200 \
    CXN_TIMEOUT=120 \
    RETRY_CXN=0

# 5000 is the default port for Flask
EXPOSE 5000

CMD python -u /app/telemetry.py
