# Compile our js source.
FROM node:12-alpine AS builder

WORKDIR /builder

COPY common/nodejs/package.json src/common/
COPY forward-interop/package.json .

RUN npm install

COPY common/messages/interop.proto \
    common/messages/stats.proto \
    src/messages/

RUN npm run build-msg

COPY common/nodejs src/common
COPY forward-interop .

RUN npm run build

# Make the actual image now.
FROM node:12-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY common/scripts/wait-for-it.sh .

RUN apk --no-cache add \
    curl

COPY common/nodejs/package.json src/common/
COPY forward-interop/package.json .

RUN npm install

# Add in the output from the js builder above.
COPY --from=builder /builder/lib lib

COPY /forward-interop/bin bin

ENV PORT=4000 \
    INTEROP_PROXY_HOST='interop-proxy' \
    INTEROP_PROXY_PORT='8000' \
    TELEMETRY_HOST='telemetry' \
    TELEMETRY_PORT='5000' \
    UPLOAD_INTERVAL='200'

EXPOSE 4000

# Wait for a response from interop-proxy and the telemetry service
# first.
CMD ./wait-for-it.sh \
        "http://$INTEROP_PROXY_HOST:$INTEROP_PROXY_PORT/api/alive" \
        "interop proxy" && \
    ./wait-for-it.sh \
        "http://$TELEMETRY_HOST:$TELEMETRY_PORT/api/alive" \
        "telemetry service" && \
    printf 'Starting.\n' && \
    FORCE_COLOR=1 npm start --silent
