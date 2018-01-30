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
        message = conn.params
        |> form_message(module)
        |> decode_base64()
        |> decode_enums()

        {:ok, message, conn}
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
  defp decode_base64(%Odlc{image: nil} = message), do: message
  defp decode_base64(%Odlc{} = message),
    do: Map.update! message, :image, &Base.decode64!/1
  defp decode_base64(message), do: message

  @enum_fields [
    :type, :orientation, :shape, :background_color, :alphanumeric_color
  ]

  # JSON enum constants should be converted to atoms.
  defp decode_enums(%Odlc{} = message) do
    Enum.reduce @enum_fields, message, fn field, acc ->
      Map.update! acc, field, &string_to_atom/1
    end
  end

  defp decode_enums(message), do: message

  defp string_to_atom(nil), do: nil
  defp string_to_atom(string), do: string |> String.upcase |> String.to_atom

  def parse_body(%Plug.Conn{} = conn, acc \\ <<>>) do
    case read_body conn do
      {:ok,   body, next_conn} -> {:ok, acc <> body, next_conn}
      {:more, body, next_conn} -> parse_body next_conn, acc <> body
      other                    -> other
    end
  end
end
