ARG BASE_BUILDER=node:8-alpine
ARG BASE=nginx:alpine

# Compile the front end.
FROM ${BASE_BUILDER} AS builder

WORKDIR /builder

COPY image-rec-manual-ui/package.json .

RUN npm install

COPY common/messages/imagery.proto \
    common/messages/image_rec.proto \
    common/messages/interop.proto \
    common/messages/telemetry.proto \
    src/messages/

RUN npm run build-msg

COPY image-rec-manual-ui .

RUN npm run build

# Making the actual image now.
FROM ${BASE}

WORKDIR /app

# Copying built assets from above.
COPY --from=builder /builder/dist/static static

COPY image-rec-manual-ui/nginx.conf /etc/nginx/nginx.conf

ENV PORT=8084 \
    IMAGE_REC_MANUAL_API_HOST='image-rec-manual-api' \
    IMAGE_REC_MANUAL_API_PORT='8083'

EXPOSE 8084

# Get the Docker embedded DNS server for nginx, and place in the DNS
# server, the port to host on, and the image-rec-manual-api host and
# port to the nginx configuration and start.
CMD export RESOLVER=$(grep -o -E '([0-9]{1,3}[\.]){3}[0-9]{1,3}' \
        /etc/resolv.conf) && \
    envsubst '$PORT $RESOLVER $IMAGE_REC_MANUAL_API_HOST \
        $IMAGE_REC_MANUAL_API_PORT' \
        < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf && \
    nginx
