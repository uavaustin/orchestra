ARG BASE=node:8-slim

# Not using a builder for this since we need a bunch of things anways
# just to build the gphoto2 library from source.
FROM ${BASE}

WORKDIR /app

# We need packages to install gphoto2 node dependency.
RUN apt-get update && apt-get install -y \
    make \
    g++ \
    git \
    python-dev \
    libgphoto2-dev

COPY imagery/package.json .

RUN npm install

COPY imagery .

RUN npm run build

ENV TELEMETRY_URL='0.0.0.0:5000'

EXPOSE 9000

CMD npm start --silent
