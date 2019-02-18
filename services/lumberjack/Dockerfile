ARG BASE=node:8-alpine

# Compile our js source.
FROM ${BASE} AS builder

WORKDIR /builder

# We need packages to install the net-ping node dependency.
RUN apk --no-cache add \
    make \
    g++ \
    python-dev

COPY common/nodejs/package.json src/common/
COPY lumberjack/package.json .

RUN npm install

COPY common/messages/stats.proto \
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

ENV INFLUX_PORT=8086 \
    INFLUX_HOST='localhost' 

EXPOSE 6000

CMD FORCE_COLOR=1 npm start --silent
