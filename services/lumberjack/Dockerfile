ARG BASE=node:8-alpine

# Compile our js source.
FROM ${BASE} AS builder

WORKDIR /builder

RUN apk --no-cache add \
    make \
    g++ \
    python-dev

COPY common/nodejs/package.json src/common/
COPY lumberjack/package.json .

RUN npm install

COPY common/messages/stats.proto \
	 common/messages/telemetry.proto \
    src/messages/

RUN npm run build-msg

COPY common/nodejs src/common
COPY lumberjack .

RUN npm run build

# Make the actual image now.
FROM ${BASE}

WORKDIR /app

# Copying over raw-socket since we don't have to build it again.

ENV NODE_ENV=production

COPY common/nodejs/package.json src/common/
COPY lumberjack/package.json .

RUN npm install

# Add in the output from the js builder above.
COPY --from=builder /builder/lib lib

COPY /lumberjack/bin bin

ENV INFLUX_HOST='influx' \
	INFLUX_PORT=8086 \
    PING_HOST='pong' \
	PING_PORT=7000 \
	FORWARD_INTEROP_HOST='forward-interop' \
	FORWARD_INTEROP_PORT=4000 \
	TELEMETRY_HOST='telemetry' \
	TELEMETRY_PORT=5000 \
	TASK_TIMEOUT=4000 \
	QUEUE_LIMIT=10

EXPOSE 6000

CMD FORCE_COLOR=1 npm start --silent
