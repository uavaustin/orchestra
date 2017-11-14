ARG BASE=python:3.6-slim

FROM ${BASE}

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY . .

# Setting the default dronekit connection options

ENV CXN_STR=0.0.0.0:14550 \
    BAUD_RATE=115200 \
    TIMEOUT=120

CMD FLASK_APP=telemetry.py flask run --host 0.0.0.0
