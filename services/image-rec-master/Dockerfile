ARG BASE=node:8-slim

# Compile our js source
FROM ${BASE} AS builder

WORKDIR /builder

COPY image-rec-master/package.json .

RUN npm install

COPY image-rec-master/src/messages src/messages

RUN npm run build-msg

COPY image-rec-master .

RUN npm run build

# Making the actual image now
FROM ${BASE}

WORKDIR /app

# We need curl so we can wait for the imagery service to be online
RUN apt-get update && apt-get install -y \
    curl

COPY image-rec-master/package.json .

RUN export NODE_ENV=production && npm install

COPY common/scripts/wait-for-it.sh .

# Adding in the output from the js builder above
COPY --from=builder /builder/lib lib

ENV IMAGERY_URL='0.0.0.0:8081' \
    REDIS_URL='0.0.0.0:6379'

EXPOSE 8082

# Waiting for a response from the imagery service first
CMD ./wait-for-it.sh "http://$IMAGERY_URL/api/alive" "imagery service" && \
    npm start --silent
