FROM elixir:1.8-alpine as builder

WORKDIR /builder

ENV MIX_ENV=prod

# Setting up the package manager.
RUN mix local.hex --force && mix local.rebar --force

COPY interop-proxy/mix.exs .

# Fetching and then compiling our deps first.
RUN mix deps.get && mix deps.compile

COPY interop-proxy .
COPY common/messages lib/messages

# Make a release so we can copy it later. (Cleaning mime since we
# have the custom protobuf mime type.)
RUN mix compile && mix deps.clean mime --build && mix release

# Moving the archive to the top directory so it can be accessed
# easily below.
RUN cp _build/prod/rel/interop_proxy/releases/*/interop_proxy.tar.gz .

# Making the production image now.
FROM alpine:3.9

WORKDIR /app

# Bash is needed because of distillery and libssl is needed by
# :erlang.crypto.
RUN apk --no-cache add \
    bash \
    libssl1.1

# Getting the archive from the builder, then uncompressing it.
COPY --from=builder /builder/interop_proxy.tar.gz .

RUN tar -xzf interop_proxy.tar.gz && \
    rm -rf interop_proxy.tar.gz

ENV LANG="C.UTF-8"

EXPOSE 8000

CMD /app/bin/interop_proxy foreground
