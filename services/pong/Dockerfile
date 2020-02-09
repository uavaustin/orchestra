# Compile our js source.
FROM node:12-alpine AS builder

WORKDIR /builder

# We need packages to install the net-ping node dependency.
RUN apk --no-cache add \
    make \
    g++ \
    python-dev

COPY common/nodejs/package.json src/common/
COPY pong/package.json .

RUN npm install

COPY common/messages/stats.proto \
    src/messages/

RUN npm run build-msg

COPY common/nodejs src/common
COPY pong .

RUN npm run build

# Make the actual image now.
FROM node:12-alpine

WORKDIR /app

# Copying over raw-socket since we don't have to build it again.
COPY --from=builder /builder/node_modules/raw-socket node_modules/raw-socket

ENV NODE_ENV=production

COPY common/nodejs/package.json src/common/
COPY pong/package.json .

RUN npm install

# Add in the output from the js builder above.
COPY --from=builder /builder/lib lib

COPY /pong/bin bin

ENV PORT=7000 \
    SERVICE_TIMEOUT=5000 \
    PING_SERVICES='' \
    PING_DEVICES=''

EXPOSE 7000

CMD FORCE_COLOR=1 npm start --silent
