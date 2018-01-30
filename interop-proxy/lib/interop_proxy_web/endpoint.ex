defmodule InteropProxyWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :interop_proxy

  plug Plug.Logger

  plug Plug.Parsers,
    parsers: [:json],
    pass: ["*/*"],
    json_decoder: Poison

  plug Plug.MethodOverride
  plug Plug.Head

  plug InteropProxyWeb.Router

  @doc """
  Callback for dynamically configuring the endpoint.

  Since this is containerized, we really don't need any dynamic
  configuration.
  """
  def init(_key, config), do: {:ok, config}
end
