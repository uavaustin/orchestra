use Mix.Config

config :interop_proxy,
  url: "localhost:8081",
  username: "testuser",
  password: "testpass"

config :interop_proxy, InteropProxyWeb.Endpoint,
  http: [port: 8001],
  server: false

config :logger, level: :warn
