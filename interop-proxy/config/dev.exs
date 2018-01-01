use Mix.Config

config :interop_proxy,
  url: "localhost:8080",
  username: "testuser",
  password: "testpass"

config :interop_proxy, InteropProxyWeb.Endpoint,
  http: [port: 5000],
  debug_errors: true,
  check_origin: false
