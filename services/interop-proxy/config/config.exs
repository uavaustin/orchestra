use Mix.Config

config :flasked,
  otp_app: :interop_proxy,
  map_file: "priv/flasked_env.exs"

config :interop_proxy, InteropProxyWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [view: InteropProxyWeb.ErrorView, accepts: ~w(json)],
  pubsub: [name: InteropProxy.PubSub, adapter: Phoenix.PubSub.PG2]

config :mime, :types, %{
  "application/x-protobuf" => ["protobuf"]
}

import_config "#{Mix.env}.exs"
