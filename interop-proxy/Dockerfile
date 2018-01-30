ARG BASE_BUILDER=elixir:1.5-slim
ARG BASE=debian:jessie-slim

FROM ${BASE_BUILDER} as builder

WORKDIR /builder

ENV MIX_ENV=prod

RUN mix local.hex --force && mix local.rebar --force

COPY interop-proxy/mix.exs .

RUN mix deps.get

COPY interop-proxy .
COPY common/messages lib/messages

RUN mix release

# Moving the archive to the top directory so it can be accessed
# easily below.
RUN cp _build/prod/rel/interop_proxy/releases/*/interop_proxy.tar.gz .

# Making the production image now.
FROM ${BASE}

WORKDIR /app

RUN apt-get update && apt-get install -y \
    libssl1.0.0

# Getting the archive from the builder, then uncompressing it
COPY --from=builder /builder/interop_proxy.tar.gz .

RUN tar -xzf interop_proxy.tar.gz && \
    rm -rf interop_proxy.tar.gz

ENV LANG="C.UTF-8"

EXPOSE 8000

CMD /app/bin/interop_proxy foreground
