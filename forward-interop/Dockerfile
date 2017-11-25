ARG BASE=node:8-slim

# Compile our js source
FROM ${BASE} AS builder

WORKDIR /builder

COPY forward-interop/package.json .

RUN npm install

COPY forward-interop .

RUN npm run build

# Making the actual image now
FROM ${BASE}

WORKDIR /app

# We need curl so we can wait for the interop server to be online
RUN apt-get update && apt-get install -y \
    curl

COPY forward-interop/package.json .

RUN export NODE_ENV=production && npm install

COPY common/scripts/wait-for-it.sh .

# Adding in the output from the js builder above
COPY --from=builder /builder/lib lib

ENV INTEROP_URL='0.0.0.0:8080' \
    USERNAME='testuser' \
    PASSWORD='testpass' \
    TELEMETRY_URL='0.0.0.0:8080'

# Waiting for a response from the interop server first
CMD ./wait-for-it.sh "http://$INTEROP_URL/api/login" "interop server" && \
    ./wait-for-it.sh "http://$TELEMETRY_URL/api/alive" "telemetry service" && \
    printf 'Starting.' && \
    npm start

