defmodule InteropProxyWeb.ControllerHelpers do
  alias InteropProxy.Message.Interop.{Odlc, OdlcList}

  @doc """
  Send a message either in an encoded Protobuf or JSON if requested.

  This will check the Accepts header, if it's set to JSON it'll send
  it as JSON for easier testing and implementation when needed.
  """
  def send_message(conn, status_code \\ 200, message) do
    {content_type, binary} = case Plug.Conn.get_req_header conn, "accept" do
      ["application/json"] ->
        {"application/json; charset=utf-8", message 
                                            |> make_json_safe
                                            |> Poison.encode!}
      _ ->
        {"application/x-protobuf", message |> message.__struct__.encode}
    end

    conn
    |> Plug.Conn.put_resp_header("content-type", content_type)
    |> Plug.Conn.send_resp(status_code, binary)
  end

  # Gets binary images out of JSON since it needs to be UTF-8.
  defp make_json_safe(%Odlc{image: image} = message)
  when image not in [<<>>, nil] do
    message
    |> Map.put(:image_base64, Base.encode64(image))
    |> Map.put(:image, <<>>)
  end

  defp make_json_safe(%OdlcList{} = message) do
    Map.put message, :list, Enum.map(message.list, &make_json_safe/1) 
  end

  defp make_json_safe(message), do: message 

  @doc """
  Checking if a param string means to be `true`.
  
  If no parameter is passed, this returns false.

  This will return `true` for things like `"true"`, `"True"`, or "1".
  """
  def is_truthy(string \\ <<>>)

  def is_truthy("1"), do: true
  def is_truthy(string) when is_binary(string),
    do: String.downcase(string) === "true"
  def is_truthy(t), do: t === true
end
