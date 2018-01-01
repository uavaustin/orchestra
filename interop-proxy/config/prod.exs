use Mix.Config

config :flasked,
  otp_app: :interop_proxy,
  map_file: "priv/flasked_env.exs"

config :interop_proxy, InteropProxyWeb.Endpoint,
  http: [port: 5000],
