defmodule InteropProxyWeb.Plugs.DecodeProtobuf do
  import Plug.Conn

  import InteropProxy.Message

  def init(opts), do: opts

  def call(conn, module) do
    case decode(conn, module) do
      {nil, conn} ->
        conn
        |> send_resp(400, "")
        |> halt()
      {decoded, conn} ->
        conn
        |> assign(:protobuf, decoded)
    end
  end

  # Decodes the message into a Protobuf struct or nil. JSON data is
  # allowed for easier integration and testing if needed.
  defp decode(conn, module) do
    case get_req_header conn, "content-type" do
      ["application/x-protobuf" <> _] -> 
        with {:ok, binary, conn} <- parse_body conn do
          {module.decode(binary), conn}
        else
          _ -> {nil, conn}
        end
      ["application/json" <> _] ->
        {form_message(conn.params, module), conn}
      _ ->
        {nil, conn}
    end
  end

  def parse_body(%Plug.Conn{} = conn, acc \\ "") do
    case read_body(conn) do
      {:ok, body, next_conn} ->
        {:ok, acc <> body, next_conn}
      {:more, body, next_conn} ->
        parse_body(next_conn, acc <> body)
      other ->
        other
    end
  end
end
