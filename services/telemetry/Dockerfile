ARG BASE=node:8-slim

# Compile our js source
FROM ${BASE} AS builder

WORKDIR /builder

COPY telemetry/package.json .

RUN npm install

COPY telemetry/src/messages src/messages

RUN npm run build-msg

COPY telemetry .

RUN npm run build

# Making the actual image now
FROM ${BASE}

WORKDIR /app

COPY telemetry/package.json .

COPY telemetry/bin bin

RUN export NODE_ENV=production && npm install

# Adding in the output from the js builder above
COPY --from=builder /builder/lib lib

ENV CXN_STR=0.0.0.0:14550

EXPOSE 5000

CMD npm start --silent
