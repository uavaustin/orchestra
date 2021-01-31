defmodule InteropProxy.Message do
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
  
  The nested values can be in both optional and repeated fields.

      iex> alias InteropProxy.Message
      iex> alias InteropProxy.Message.Interop.InteropMission
      iex> map = %{waypoints: [%{lat: 12, lon: 23}]}
      iex> Message.form_message map, InteropMission
      %InteropProxy.Message.Interop.InteropMission{
        air_drop_pos: nil,
        current_mission: nil,
        emergent_pos: nil,
        fly_zones: [],
        off_axis_pos: nil,
        search_area: [],
        time: nil,
        waypoints: [
          %InteropProxy.Message.Interop.AerialPosition{
            alt_msl: nil,
            lat: 12,
            lon: 23
          }
        ]
      }

  Keys can also be strings (useful when map was converted from JSON).

      iex> alias InteropProxy.Message
      iex> alias InteropProxy.Message.Interop.InteropTelem
      iex> map = %{:time => 12, "pos" => %{"lat" => 1, "lon" => 2}}
      iex> Message.form_message map, InteropTelem
      %InteropProxy.Message.Interop.InteropTelem{
        pos: %InteropProxy.Message.Interop.AerialPosition{
          alt_msl: nil,
          lat: 1,
          lon: 2
        },
        time: 12,
        yaw: nil
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
            |> update(key, do_form_message(value, mod, defs))
          # If it's a repeated message it's a list, so we'll do the
          # above but for each element in the list.
          {mod, :repeated} ->
            struct
            |> update(key, value |> Enum.map(&do_form_message(&1, mod, defs)))
        end
      else
        # If we don't have anything nested, we're just entering a
        # normal key-value pair
        struct
        |> update(key, value)
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
      %Protobuf.Field{name: ^key} when is_atom(key) ->
        true
      %Protobuf.Field{name: atom_key} when is_binary(key) ->
        Atom.to_string(atom_key) === key
      _ ->
        false
    end)

    {mod, occurrence}
  end

  # Doing a normal key update.
  defp update(struct, key, value) when is_atom(key) do
    struct
    |> Map.put(key, value)
  end

  # Doing a key update, but converting the string to an atom.
  defp update(struct, key, value) when is_binary(key) do
    struct
    |> Map.put(key |> String.to_atom, value)
  end
end
