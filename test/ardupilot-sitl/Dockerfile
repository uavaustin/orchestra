# Adapted from: https://github.com/radarku/ardupilot-sitl-docker.

FROM ubuntu:18.04

ARG COPTER_TAG=Copter-4.0

# install git 
RUN apt-get update && apt-get install -y git

# Now grab ArduPilot from GitHub
RUN git clone https://github.com/ArduPilot/ardupilot.git ardupilot
WORKDIR ardupilot

# Checkout the latest Copter...
RUN git checkout ${COPTER_TAG}

# Now start build instructions from http://ardupilot.org/dev/docs/setting-up-sitl-on-linux.html
RUN git submodule update --init --recursive

# Trick to get apt-get to not prompt for timezone in tzdata
ENV DEBIAN_FRONTEND=noninteractive

# Need sudo and lsb-release for the installation prerequisites
RUN apt-get install -y sudo lsb-release tzdata

# Need USER set so usermod does not fail...
# Install all prerequisites now
RUN USER=nobody Tools/environment_install/install-prereqs-ubuntu.sh -y

# Continue build instructions from https://github.com/ArduPilot/ardupilot/blob/master/BUILD.md
RUN ./waf distclean
RUN ./waf configure --board sitl
RUN ./waf copter
RUN ./waf rover 
RUN ./waf plane
RUN ./waf sub

# Mavproxy installation.
RUN sudo apt-get -y install python3-dev python3-opencv python3-wxgtk4.0 python3-pip python3-matplotlib python3-lxml
RUN pip3 install PyYAML mavproxy --user
ENV PATH="/root/.local/bin:${PATH}"


# TCP 5760 is what the sim exposes by default
EXPOSE 5760/tcp

# Variables for simulator
ENV INSTANCE 0
ENV LAT 42.3898
ENV LON -71.1476
ENV ALT 14
ENV DIR 270
ENV MODEL +
ENV SPEEDUP 1
ENV VEHICLE ArduCopter

# Add our own similuation parameters
COPY ./copter.parm /ardupilot/Tools/autotest/default_params/

# Start up script
ADD start.sh /
RUN chmod +x /start.sh

# Finally the command
CMD  bash #["/start.sh"]


