use Mix.Config

config :interop_proxy, InteropProxyWeb.Endpoint,
  http: [port: 8000]

config :phoenix, :serve_endpoints, true

config :logger, level: :warn
