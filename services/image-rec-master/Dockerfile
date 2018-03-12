ARG BASE=node:8-slim

# Compile our js source
FROM ${BASE} AS builder

WORKDIR /builder

COPY image-rec-master/package.json .

RUN npm install

COPY image-rec-master .

RUN npm run build

# Making the actual image now
FROM ${BASE}

WORKDIR /app

COPY image-rec-master/package.json .

RUN export NODE_ENV=production && npm install

# Adding in the output from the js builder above
COPY --from=builder /builder/lib lib

ENV IMAGERY_URL='0.0.0.0:8081' \
    REDIS_URL='0.0.0.0:6379'

EXPOSE 8082

CMD npm start --silent
