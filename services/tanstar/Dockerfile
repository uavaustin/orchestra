# ----------
# Rust stage
# ----------

FROM rust as builder

WORKDIR /prod

COPY tanstar/Cargo.toml .

RUN cargo build --release --bin pathfinder

FROM rust as runtime

WORKDIR prod/

COPY --from=builder /prod/target/release/pathfinder /usr/local/bin

# ----------
# Node stage
# ----------

FROM node:12-alpine

ENV NODE_ENV=info \
    PORT=8765 \
    SERVICE_TIMEOUT=5000

WORKDIR /prod

COPY --from=builder /prod/target/release/pathfinder /usr/local/bin
COPY common/nodejs/package.json src/common/
COPY tanstar/package.json .

RUN npm install

COPY common/messages/interop.proto \
  common/messages/pathfinder.proto \
  common/messages/telemetry.proto \
     src/messages/

RUN npm run build-msg

COPY common/nodejs src/common
COPY tanstar .

CMD npm run local-debug
