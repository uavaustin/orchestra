defmodule InteropProxyWeb.Message do
  @moduledoc """
  Contains the Protobuf messages from exprotobuf.
  """

  @external_resource "lib/messages/interop.proto"

  use Protobuf,
    from: Path.expand("../messages/interop.proto", __DIR__),
    use_package_names: true

  @doc ~S"""
  Takes a map and turns it into a Protobuf struct recursively.

  By default, exprotobuf doesn't handle nested messages so this
  function will take care of that for us.

  ## Examples

      iex> alias InteropProxyWeb.Message
      iex> alias InteropProxyWeb.Message.Interop.Mission
      iex> map = %{home_pos: %{lat: 1}, waypoints: [%{lat: 12, lon: 23}]}
      iex> Message.form_message map, Mission
      %InteropProxyWeb.Message.Interop.Mission{
        air_drop_pos: nil,
        current_mission: nil,
        emergent_pos: nil,
        fly_zones: [],
        home_pos: %InteropProxyWeb.Message.Interop.Position{
          lat: 1,
          lon: nil
        },
        off_axis_pos: nil,
        search_area: [],
        time: nil,
        waypoints: [
          %InteropProxyWeb.Message.Interop.AerialPosition{
            alt_msl: nil,
            lat: 12,
            lon: 23
          }
        ]
      }

  """
  def form_message(map, module), do: do_form_message map, module, defs()

  defp do_form_message(map, module, defs) do
    fields = get_fields module, defs

    # Taking the map and putting entries into a new struct.
    Enum.reduce map, module.new, fn {key, value}, struct ->
      if nested? value do
        case get_nested fields, key do
          # If it's a normal nested message, recursively call the
          # function again to resolve more nested messages.
          {mod, :optional} ->
            struct
            |> Map.put(key, do_form_message(value, mod, defs))
          # If it's a repeated message it's a list, so we'll do the
          # above but for each element in the list.
          {mod, :repeated} ->
            struct
            |> Map.put(key, value |> Enum.map(&do_form_message(&1, mod, defs)))
        end
      else
        # If we don't have anything nested, we're just entering a
        # normal key-value pair
        struct
        |> Map.put(key, value)
      end
    end
  end 

  # Gets the list of fields for a message.
  defp get_fields(module, defs) do
    {_, fields} = defs
    |> Enum.find(fn
      {{:msg, ^module}, _} -> true
      _                    -> false
    end)

    fields
  end

  # Checking if a value is a nested message.
  defp nested?(value) when is_map(value),         do: true
  defp nested?([head | _tail]) when is_map(head), do: true
  defp nested?(_value),                           do: false

  # Getting the module name and occurrence for a nested message.
  defp get_nested(fields, key) do
    %Protobuf.Field{type: {:msg, mod}, occurrence: occurrence} = fields
    |> Enum.find(fn
      %Protobuf.Field{name: ^key} -> true
      _                           -> false
    end)

    {mod, occurrence}
  end

  @doc """
  Send a message either in an encoded Protobuf or JSON if requested.

  This will check the Accepts header, if it's set to JSON it'll send
  it as JSON for easier testing and implementation when needed.
  """
  def send_message(conn, status_code \\ 200, message) do
    {content_type, binary} = case Plug.Conn.get_req_header conn, "accept" do
      ["application/json"] ->
        {"application/json", Poison.encode!(message)}
      _ ->
        {"application/x-protobuf", message |> message.__struct__.encode}
    end

    conn
    |> Plug.Conn.put_resp_content_type(content_type)
    |> Plug.Conn.send_resp(status_code, binary)
  end
end
