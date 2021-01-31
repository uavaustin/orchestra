defmodule InteropProxy.Sanitize do
  @moduledoc """
  Translates the interop server responses to our own and vise-versa.
  """

  # Aliasing the main messages.
  alias InteropProxy.Message.Interop.{
    Position, AerialPosition, InteropMission, Obstacles, InteropTelem, Odlc,
    OdlcList, InteropMessage
  }

  # Aliasing the nested messages.
  alias InteropProxy.Message.Interop.InteropMission.FlyZone
  alias InteropProxy.Message.Interop.Obstacles.StationaryObstacle

  def sanitize_mission(nil) do
    %InteropMission{
      time: time(),
      current_mission: false
    }
  end

  def sanitize_mission(mission) do
    %InteropMission{
      time: time(),
      current_mission: true,
      air_drop_pos:
        mission
        |> Map.get("airDropPos", %{})
        |> sanitize_position,
      fly_zones:
        mission
        |> Map.get("flyZones", %{})
        |> sanitize_fly_zones,
      waypoints:
        mission
        |> Map.get("waypoints", %{})
        |> sanitize_aerial_position,
      off_axis_pos:
        mission
        |> Map.get("offAxisOdlcPos", %{})
        |> sanitize_position,
      emergent_pos:
        mission
        |> Map.get("emergentLastKnownPos", %{})
        |> sanitize_position,
      search_area:
        mission
        |> Map.get("searchGridPoints", %{})
        |> sanitize_aerial_position
    }
  end

  defp sanitize_fly_zones(fly_zones) do
    fly_zones
    |> Enum.map(fn fly_zone ->
      %FlyZone{
        alt_msl_max:
          fly_zone
          |> Map.get("altitudeMax", 0.0)
          |> meters,
        alt_msl_min:
          fly_zone
          |> Map.get("altitudeMin", 0.0)
          |> meters,
        boundary:
          fly_zone
          |> Map.get("boundaryPoints", %{})
          |> sanitize_position
      }
    end)
  end

  def sanitize_obstacles(obstacles) do
    %Obstacles{
      time: time(),
      stationary:
        obstacles
        |> Map.get("stationaryObstacles", [])
        |> sanitize_stationary_obstacles
    }
  end

  defp sanitize_stationary_obstacles(stationary) do
    stationary
    |> Enum.map(fn obs ->
      %StationaryObstacle{
        pos:
          obs
          |> sanitize_position,
        height:
          obs
          |> Map.get("height", 0.0)
          |> meters,
        radius:
          obs
          |> Map.get("radius", 0.0)
          |> meters
      }
    end)
  end

  def sanitize_outgoing_telemetry(%InteropTelem{} = telem) do
    %{
      latitude:
        telem.pos
        |> sanitize_outgoing_latitude,
      longitude:
        telem.pos
        |> sanitize_outgoing_longitude,
      altitude:
        telem.pos.alt_msl
        |> feet,
      heading: telem.yaw
    }
  end

  def sanitize_odlc(odlc, image \\ <<>>) do
    %Odlc{
      time: time(),
      id:
        odlc
        |> Map.get("id", 0),
      type:
        odlc
        |> Map.get("type")
        |> string_to_atom(:type),
      pos:
        odlc
        |> sanitize_position,
      orientation:
        odlc
        |> Map.get("orientation")
        |> sanitize_orientation,
      shape:
        odlc
        |> Map.get("shape")
        |> string_to_atom(:shape),
      background_color:
        odlc
        |> Map.get("shapeColor")
        |> string_to_atom(:color),
      alphanumeric:
        odlc
        |> Map.get("alphanumeric", ""),
      alphanumeric_color:
        odlc
        |> Map.get("alphanumericColor")
        |> string_to_atom(:color),
      description:
        odlc
        |> Map.get("description", ""),
      autonomous:
        odlc
        |> Map.get("autonomous", false),
      image: image
    }
  end

  def sanitize_odlc_list(odlcs) do
    time = time()

    %OdlcList{time: time, list: Enum.map(odlcs, &Map.put(&1, :time, time))}
  end

  def sanitize_outgoing_odlc(%Odlc{type: :EMERGENT} = odlc) do
    outgoing_odlc = %{
      type:
        odlc.type
        |> atom_to_string,
      latitude:
        odlc.pos
        |> sanitize_outgoing_latitude,
      longitude:
        odlc.pos
        |> sanitize_outgoing_longitude,
      description:
        odlc.description
        |> parse_string,
      autonomous:
        case odlc.autonomous do
          nil -> false
          bool -> bool
        end
    }

    outgoing_image =
      case odlc.image do
        nil -> <<>>
        string -> string
      end 

    {outgoing_odlc, outgoing_image}
  end

  def sanitize_outgoing_odlc(%Odlc{} = odlc) do
    outgoing_odlc = %{
      type:
        odlc.type
        |> atom_to_string,
      latitude:
        odlc.pos
        |> sanitize_outgoing_latitude,
      longitude:
        odlc.pos
        |> sanitize_outgoing_longitude,
      orientation:
        odlc.orientation
        |> sanitize_outgoing_orientation,
      shape:
        odlc.shape
        |> atom_to_string,
      shapeColor:
        odlc.background_color
        |> atom_to_string,
      alphanumeric:
        odlc.alphanumeric
        |> parse_string,
      alphanumeric_color:
        odlc.alphanumeric_color
        |> atom_to_string,
      autonomous:
        case odlc.autonomous do
          nil -> false
          bool -> bool
        end
    }

    outgoing_image =
      case odlc.image do
        nil -> <<>>
        string -> string
      end 

    {outgoing_odlc, outgoing_image}
  end

  def sanitize_message(text) do
    %InteropMessage{
      time: time(),
      text: text
    }
  end

  defp sanitize_position(pos) when is_list(pos) do
    pos
    |> Enum.map(&sanitize_position/1)
  end

  defp sanitize_position(pos) do
    %Position{
      lat:
        pos
        |> Map.get("latitude", 0.0),
      lon:
        pos
        |> Map.get("longitude", 0.0),
    }
  end

  defp sanitize_aerial_position(pos) when is_list(pos) do
    pos
    |> Enum.map(&sanitize_aerial_position/1)
  end

  defp sanitize_aerial_position(pos) do
    %AerialPosition{
      lat:
        pos
        |> Map.get("latitude", 0.0),
      lon:
        pos
        |> Map.get("longitude", 0.0),
      alt_msl:
        pos
        |> Map.get("altitude", 0.0)
        |> meters
    }
  end

  defp sanitize_outgoing_latitude(%Position{} = pos), do: pos.lat
  defp sanitize_outgoing_latitude(%AerialPosition{} = pos), do: pos.lat
  defp sanitize_outgoing_latitude(nil), do: 0.0

  defp sanitize_outgoing_longitude(%Position{} = pos), do: pos.lon
  defp sanitize_outgoing_longitude(%AerialPosition{} = pos), do: pos.lon
  defp sanitize_outgoing_longitude(nil), do: 0.0

  defp sanitize_orientation(string) do
    case string do
      nil -> :UNKNOWN_ORIENTATION
      "N" -> :NORTH
      "NE" -> :NORTHEAST
      "E" -> :EAST
      "SE" -> :SOUTHEAST
      "S" -> :SOUTH
      "SW" -> :SOUTHWEST
      "W" -> :WEST
      "NW" -> :NORTHWEST
    end
  end

  defp sanitize_outgoing_orientation(atom) do
    case atom do
      nil -> nil
      :UNKNOWN_ORIENTATION -> nil
      :NORTH -> "N"
      :NORTHEAST -> "NE"
      :EAST -> "E"
      :SOUTHEAST -> "SE"
      :SOUTH -> "S"
      :SOUTHWEST -> "SW"
      :WEST -> "W"
      :NORTHWEST -> "NW"
    end
  end

  defp meters(feet), do: feet * 0.3048

  defp feet(meters), do: meters / 0.3048

  defp string_to_atom(nil, :type), do: :STANDARD
  defp string_to_atom(nil, :shape), do: :UNKNOWN_SHAPE
  defp string_to_atom(nil, :color), do: :UNKNOWN_COLOR
  defp string_to_atom(string, _), do: string |> String.to_atom()

  defp atom_to_string(nil), do: nil
  defp atom_to_string(:UNKNOWN_SHAPE), do: nil
  defp atom_to_string(:UNKNOWN_COLOR), do: nil
  defp atom_to_string(atom), do: atom |> Atom.to_string() |> String.upcase()

  defp parse_string(<<>>), do: nil
  defp parse_string(string), do: string

  defp time() do
    DateTime.utc_now()
    |> DateTime.to_unix(:millisecond)
    |> Kernel./(1000)
  end
end
