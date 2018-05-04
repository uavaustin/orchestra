ARG BASE=node:8-slim

# Compile our js source
FROM ${BASE} AS builder

WORKDIR /builder

COPY pong/package.json .

RUN npm install

COPY pong .

RUN npm run build

# Making the actual image now
FROM ${BASE}

WORKDIR /app

COPY pong/package.json .

RUN export NODE_ENV=production && npm install

# Adding in the output from the js builder above
COPY --from=builder /builder/lib lib

# Amount of time in a request until a service is said to be offline
ENV REQUEST_TIMEOUT=5000

EXPOSE 7000

ENTRYPOINT ["npm", "start", "--silent"]
