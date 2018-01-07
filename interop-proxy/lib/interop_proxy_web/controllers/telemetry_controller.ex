defmodule InteropProxyWeb.TelemetryController do
  use InteropProxyWeb, :controller

  plug InteropProxyWeb.Plugs.DecodeProtobuf, InteropTelem
  when action in [:create]

  def create(conn, _params) do
    send_message conn, InteropProxy.post_telemetry!(conn.assigns.protobuf)
  end
end
