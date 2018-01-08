defmodule InteropProxyWeb.Plugs.DecodeProtobuf do
  import Plug.Conn

  alias InteropProxy.Message.Interop.Odlc

  import InteropProxy.Message

  def init(opts), do: opts

  def call(conn, module) do
    case decode(conn, module) do
      {:error, reason, conn} ->
        conn
        |> put_resp_content_type("text/plain")
        |> send_resp(400, reason)
        |> halt()
      {:ok, decoded, conn} ->
        assign conn, :protobuf, decoded
    end
  end

  # Decodes the message into a Protobuf struct or nil. JSON data is
  # allowed for easier integration and testing if needed. Anything
  # that is not JSON will be interpreted as being a Protobuf.
  defp decode(conn, module) do
    case get_req_header conn, "content-type" do
      ["application/json" <> _] ->
        {:ok, form_message(conn.params, module) |> remove_base64, conn}
      _ ->
        with {:ok, binary, conn} <- parse_body conn do
          {:ok, module.decode(binary), conn}
        else
          _ ->
            {:error, "Error while parsing Protobuf body.", conn}
      end
    end
  end

  # JSON messages that have base64 images should be converted.
  defp remove_base64(%Odlc{image_base64: image_base64} = message)
  when not image_base64 in [<<>>, nil] do
    message
    |> Map.put(:image, Base.decode64(image_base64))
    |> Map.put(:image_base64, <<>>)
  end

  defp remove_base64(message), do: message

  def parse_body(%Plug.Conn{} = conn, acc \\ <<>>) do
    case read_body conn do
      {:ok,   body, next_conn} -> {:ok, acc <> body, next_conn}
      {:more, body, next_conn} -> parse_body next_conn, acc <> body
      other                    -> other
    end
  end
end
