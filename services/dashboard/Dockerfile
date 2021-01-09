# Compile our js source
FROM node:12-slim AS builder

WORKDIR /builder

COPY dashboard/package.json .

RUN npm install

COPY common/messages/stats.proto \
    src/messages/

RUN npm run build-msg

COPY dashboard .

RUN npm run build

# Making the actual image now
FROM node:12-slim

WORKDIR /app

COPY dashboard/package.json .

RUN export NODE_ENV=production && npm install

# Adding in the output from the js builder above
COPY --from=builder /builder/lib lib

ENV FORWARD_INTEROP_URL='0.0.0.0:4000' \
    PONG_URL='0.0.0.0:7000'

ENV LANG=en_US.UTF-8

CMD npm start --silent
