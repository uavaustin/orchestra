FROM node:12-alpine

ENV NODE_ENV=info \
    PORT=8765 \
    SERVICE_TIMEOUT=5000

WORKDIR /prod

COPY common/nodejs/package.json src/common/
COPY tanstar/package.json .

RUN npm install

COPY common/messages/telemetry.proto \
     src/messages/

RUN npm run build-msg

COPY common/nodejs src/common
COPY tanstar .

CMD npm run local-debug
