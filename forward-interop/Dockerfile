# First we'll use the protobuf image to compile telemetry protobufs
# for js
ARG BASE_PROTOBUF=uavaustin/protobuf
ARG BASE=node:8-slim

FROM ${BASE_PROTOBUF} AS protobuf-builder

COPY common/messages/telemetry.proto messages/telemetry.proto

RUN mkdir /dist

RUN protoc -I="messages" \
    --js_out=import_style=commonjs,binary:"/dist" \
    "messages/telemetry.proto"

# Compile our js source
FROM ${BASE} AS js-builder

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
COPY --from=js-builder /builder/lib lib

# Adding in the output from the protobuf builder above
COPY --from=protobuf-builder /dist lib/messages

ENV INTEROP_URL='0.0.0.0:8080' \
    USERNAME='testuser' \
    PASSWORD='testpass'

# Waiting for a response from the interop server first
CMD ./wait-for-it.sh "http://$INTEROP_URL/api/login" "interop server" && \
    printf 'Starting.' && \
    npm start

