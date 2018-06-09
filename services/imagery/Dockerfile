ARG BASE=node:8-alpine

# Compile our js source.
FROM ${BASE} AS builder

WORKDIR /builder

# We need packages to install the gphoto2 node dependency.
RUN apk --no-cache add \
    make \
    g++ \
    git \
    python-dev \
    libgphoto2-dev

COPY imagery/package.json .

RUN npm install

COPY imagery/src/messages src/messages

RUN npm run build-msg

COPY imagery .

RUN npm run build

# Making the actual image now.
FROM ${BASE}

WORKDIR /app

# We need both libgphoto2 and graphicsmagick at runtime.
RUN apk --no-cache add \
    libgphoto2-dev \
    graphicsmagick

# Copying over gphoto2 since we don't have to build it again.
COPY --from=builder /builder/node_modules/gphoto2 node_modules/gphoto2

COPY imagery/package.json .

RUN export NODE_ENV=production && npm install

# Adding in the output from the js builder above.
COPY --from=builder /builder/lib lib

# Must be one of "camera", "file", "sync".
ENV BACKEND='camera' \
    # Must be set if using the sync backend.
    IMAGERY_SYNC_URL='' \
    # Can be set when using the camera backend.
    TELEMETRY_URL='' \
    # Interval to trigger camera images at in the camera backend.
    # Defaults to 2 seconds.
    CAPTURE_INTERVAL='2'

EXPOSE 8081

CMD npm start --silent
