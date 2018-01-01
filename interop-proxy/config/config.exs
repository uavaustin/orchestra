use Mix.Config

config :interop_proxy, InteropProxyWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [view: InteropProxyWeb.ErrorView, accepts: ~w(json)],
  pubsub: [name: InteropProxy.PubSub, adapter: Phoenix.PubSub.PG2]

import_config "#{Mix.env}.exs"
