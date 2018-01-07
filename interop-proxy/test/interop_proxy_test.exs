defmodule InteropProxyTest do
  use ExUnit.Case

  alias InteropProxy.Message.Interop.{AerialPosition, InteropTelem}

  import InteropProxy

  test "get the active mission" do
    mission = get_active_mission!()

    assert mission.current_mission === true
    assert is_float(mission.home_pos.lat)
  end

  test "get moving and stationary obstacles" do
    obs = get_obstacles!()

    assert is_list(obs.stationary)
    assert is_list(obs.moving)

    assert is_float(Enum.at(obs.stationary, 0).pos.lat)
    assert is_float(Enum.at(obs.stationary, 0).pos.lat)
  end

  test "post valid telemetry" do
    telem = %InteropTelem{
      pos: %AerialPosition{
        lat: 30,
        lon: 60,
        alt_msl: 100
      },
      yaw: 77
    }

    message = post_telemetry!(telem)

    assert is_binary(message.text)
  end
end
