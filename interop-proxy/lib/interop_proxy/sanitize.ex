defmodule InteropProxy.Sanitize do
  @moduledoc """
  Translates the interop server responses to our own and vise-versa.
  """

  # Aliasing the main messages.
  alias InteropProxy.Message.Interop.{
    Position, AerialPosition, Mission, Obstacles, InteropTelem, Odlc, OdlcList,
    InteropMessage
  }

  # Aliasing the nested messages.
  alias InteropProxy.Message.Interop.Mission.FlyZone
  alias InteropProxy.Message.Interop.Obstacles.{
    StationaryObstacle, MovingObstacle
  }

  def sanitize_mission(nil) do
    %Mission{
      time: time(),
      current_mission: false
    }
  end

  def sanitize_mission(mission) do
    %Mission{
      time: time(),
      current_mission: true,
      air_drop_pos: mission["air_drop_pos"] |> sanitize_position,
      fly_zones: mission["fly_zones"] |> sanitize_fly_zones,
      home_pos: mission["home_pos"] |> sanitize_position,
      waypoints: mission["mission_waypoints"] |> sanitize_aerial_position,
      off_axis_pos: mission["off_axis_odlc_pos"] |> sanitize_position,
      emergent_pos: mission["emergent_last_known_pos"] |> sanitize_position,
      search_area: mission["search_grid_points"] |> sanitize_aerial_position
    }
  end

  defp sanitize_fly_zones(fly_zones) do
    fly_zones
    |> Enum.map(fn fly_zone -> 
      %FlyZone{
        alt_msl_max: fly_zone["altitude_msl_max"] |> meters,
        alt_msl_min: fly_zone["altitude_msl_min"] |> meters,
        boundary: fly_zone["boundary_pts"] |> sanitize_position
      }
    end)
  end

  def sanitize_obstacles(obstacles) do
    %Obstacles{
      time: time(),
      stationary: obstacles["stationary_obstacles"]
                  |> sanitize_stationary_obstacles,    
      moving: obstacles["moving_obstacles"]
              |> sanitize_moving_obstacles
    }
  end

  defp sanitize_stationary_obstacles(stationary) do
    stationary
    |> Enum.map(fn obs ->
      %StationaryObstacle{
        pos: obs |> sanitize_position,
        height: obs["cylinder_height"] |> meters,
        radius: obs["cylinder_radius"] |> meters
      }
    end)
  end

  defp sanitize_moving_obstacles(moving) do
    moving
    |> Enum.map(fn obs ->
      %MovingObstacle{
        pos: obs |> sanitize_aerial_position,
        radius: obs["sphere_radius"] |> meters
      }
    end)
  end

  def sanitize_outgoing_telemetry(%InteropTelem{} = telem) do
    %{
      latitude: telem.pos |> santiize_outgoing_latitude,
      longitude: telem.pos |> santiize_outgoing_longitude,
      altitude_msl: telem.pos.alt_msl |> feet,
      uas_heading: telem.yaw
    }
  end

  def sanitize_odlc(odlc, image \\ <<>>) do
    %Odlc{
      time: time(),
      id: odlc["id"],
      type: odlc["type"] |> string_to_atom,
      pos: odlc |> sanitize_position,
      orientation: odlc["orientation"] |> string_to_atom,
      shape: odlc["shape"] |> string_to_atom,
      background_color: odlc["background_color"] |> string_to_atom,
      alphanumeric: odlc["alphanumeric"],
      alphanumeric_color: odlc["alphanumeric_color"] |> string_to_atom,
      description: odlc["description"]
                   |> (&(if &1 === :EMERGENT, do: &1, else: <<>>)).(),
      autonomous: odlc["autonomous"],
      image: image
    }
  end

  def sanitize_odlc_list(odlcs) do
    time = time()

    %OdlcList{time: time, list: Enum.map(odlcs, &Map.put(&1, :time, time))}
  end

  def sanitize_outgoing_odlc(%Odlc{type: :EMERGENT} = odlc) do
    outgoing_odlc = %{
      type: odlc.type |> atom_to_string,
      latitude: odlc.pos |> santiize_outgoing_latitude,
      longitude: odlc.pos |> santiize_outgoing_longitude,
      description: parse_string(odlc.description),
      autonomous: odlc.autonomous |> (&(if &1 === nil, do: false, else: &1)).()
    }

    {outgoing_odlc, odlc.image |> (&(if &1 === nil, do: <<>>, else: &1)).()}
  end

  def sanitize_outgoing_odlc(%Odlc{} = odlc) do
    outgoing_odlc = %{
      type: odlc.type |> atom_to_string,
      latitude: odlc.pos |> santiize_outgoing_latitude,
      longitude: odlc.pos |> santiize_outgoing_longitude,
      orientation: odlc.orientation |> atom_to_string,
      shape: odlc.shape |> atom_to_string,
      background_color: odlc.background_color |> atom_to_string,
      alphanumeric: odlc.alphanumeric,
      alphanumeric_color: odlc.alphanumeric_color |> atom_to_string,
      autonomous: odlc.autonomous |> (&(if &1 === nil, do: false, else: &1)).()
    }

    {outgoing_odlc, odlc.image |> (&(if &1 === nil, do: <<>>, else: &1)).()}
  end

  def sanitize_message(text) do
    %InteropMessage{
      time: time(),
      text: text
    }
  end

  defp sort_order(list) do
    list
    |> Enum.sort(fn a, b -> a["order"] < b["order"] end)
  end

  defp sanitize_position(pos) when is_list(pos) do
    pos
    |> sort_order
    |> Enum.map(&sanitize_position/1)
  end

  defp sanitize_position(pos) do
    %Position{
      lat: pos["latitude"],
      lon: pos["longitude"]
    }
  end

  defp sanitize_aerial_position(pos) when is_list(pos) do
    pos
    |> sort_order
    |> Enum.map(&sanitize_aerial_position/1)
  end

  defp sanitize_aerial_position(pos) do
    %AerialPosition{
      lat: pos["latitude"],
      lon: pos["longitude"],
      alt_msl: pos["altitude_msl"] |> meters
    }
  end

  defp santiize_outgoing_latitude(%Position{} = pos), do: pos.lat
  defp santiize_outgoing_latitude(%AerialPosition{} = pos), do: pos.lat
  defp santiize_outgoing_latitude(nil), do: 0.0

  defp santiize_outgoing_longitude(%Position{} = pos), do: pos.lon
  defp santiize_outgoing_longitude(%AerialPosition{} = pos), do: pos.lon
  defp santiize_outgoing_longitude(nil), do: 0.0

  defp meters(feet), do: feet * 0.3048

  defp feet(meters), do: meters / 0.3048

  defp string_to_atom(nil), do: :NONE
  defp string_to_atom(string), do: string |> String.upcase |> String.to_atom

  defp atom_to_string(nil), do: nil
  defp atom_to_string(:NONE), do: nil
  defp atom_to_string(atom), do: atom |> Atom.to_string |> String.downcase

  defp parse_string(<<>>),   do: nil
  defp parse_string(string), do: string

  defp time() do
    milliseconds = DateTime.utc_now()
    |> DateTime.to_unix(:millisecond)

    milliseconds / 1000
  end
end
