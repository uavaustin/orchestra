ARG BASE=debian:stretch-slim

FROM ${BASE}

RUN apt-get update && apt-get install -y \
    python-pip \
    python-dev \
    python-opencv \
    python-wxgtk3.0 \
    python-lxml

RUN pip install mavproxy

COPY mavproxy/.mavinit.scr .

ENTRYPOINT ["mavproxy.py"]
