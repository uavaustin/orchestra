defmodule InteropProxyWeb.TelemetryController do
  use InteropProxyWeb, :controller

  plug InteropProxyWeb.Plugs.DecodeProtobuf, InteropTelem
  when action in [:create]

  def create(conn, _params) do
    message = conn.assigns.protobuf
    |> InteropProxy.post_telemetry!
    |> form_message(InteropMessage)

    conn
    |> send_message(message)
  end
end
