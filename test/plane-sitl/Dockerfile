FROM debian:stretch-slim

WORKDIR /app

# We'll need to get both python2 and python3 for both mavproxy and
# dronekit-sitl, respectively
RUN apt-get update && apt-get install -y \
    python \
    python-dev \
    python-pip \
    python-opencv \
    python-wxgtk3.0 \
    python-lxml \
    python3 \
    python3-dev \
    python3-pip

RUN pip install mavproxy

RUN pip3 install dronekit-sitl pyserial

# Going to run dronekit-sitl help since it downloads the plane model
# here
RUN dronekit-sitl plane --help

EXPOSE 14550

ENV PLANE_HOME=30.2836224,-97.7324858,1000,90

# Start dronekit-sitl in the background, and then run mavproxy as a
# daemon. In order to interact with the plane, another mavproxy
# instance will need to connect to this one
CMD dronekit-sitl plane --home $PLANE_HOME & sleep 4 && mavproxy.py \
    --master tcp:127.0.0.1:5760 \
    --sitl 127.0.0.1:5501 \
    --out udpin:0.0.0.0:14550 \
    --daemon
