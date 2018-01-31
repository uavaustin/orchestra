use Mix.Config

config :interop_proxy, InteropProxyWeb.Endpoint,
  http: [port: 8000],
  debug_errors: true,
  check_origin: false
