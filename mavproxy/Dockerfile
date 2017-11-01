ARG BASE=debian:stretch-slim

FROM ${BASE}

RUN apt-get update && apt-get install -y \
    python-pip \
    python-dev \
    python-opencv \
    python-wxgtk3.0 \
    libxml2-dev

RUN pip install mavproxy

ENTRYPOINT ["mavproxy.py"]
