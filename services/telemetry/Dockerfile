# Compile our js source.
FROM node:12-alpine AS builder

WORKDIR /builder

COPY common/nodejs/package.json src/common/
COPY telemetry/package.json .

RUN npm install

COPY common/messages/interop.proto \
    common/messages/telemetry.proto \
    src/messages/

RUN npm run build-msg

COPY common/nodejs src/common
COPY telemetry .

RUN npm run build

# Make the actual image now.
FROM node:12-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY common/nodejs/package.json src/common/
COPY telemetry/package.json .

RUN npm install

# Add in the output from the js builder above.
COPY --from=builder /builder/lib lib

COPY telemetry/bin bin

ENV PORT=5000 \
    PLANE_HOST='mavproxy' \
    PLANE_PORT='14550'

EXPOSE 5000

CMD FORCE_COLOR=1 npm start --silent
