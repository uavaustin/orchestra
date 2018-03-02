ARG BASE=node:8-slim

# Compile our js source
FROM ${BASE} AS builder

WORKDIR /builder

COPY dashboard/package.json .

RUN npm install

COPY dashboard .

RUN npm run build

# Making the actual image now
FROM ${BASE}

WORKDIR /app

COPY dashboard/package.json .

RUN export NODE_ENV=production && npm install

# Adding in the output from the js builder above
COPY --from=builder /builder/lib lib

ENV INTEROP_PROXY_URL='0.0.0.0:8000' \
    FORWARD_INTEROP_URL='0.0.0.0:4000' \
    PONG_URL='0.0.0.0:7000'

CMD npm start --silent
