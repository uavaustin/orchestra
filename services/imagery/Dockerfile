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
    libgphoto2-dev \
    graphicsmagick

COPY imagery/package.json .

RUN npm install

COPY imagery .

RUN npm run build

# Must be one of "camera", "file", "sync".
ENV BACKEND='camera' \
    # Must be set if using the sync backend.
    IMAGERY_SYNC_URL=''

EXPOSE 8081

CMD npm start --silent
