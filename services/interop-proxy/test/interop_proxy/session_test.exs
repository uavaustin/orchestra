defmodule InteropProxy.SessionTest do
  use ExUnit.Case

  alias InteropProxy.Request
  alias InteropProxy.Session
  alias InteropProxy.TestHelper

  import TestHelper, only: [url: 0, username: 0, password: 0, mission_id: 0]

  test "after starting a session, the cookie can be used for more requests" do
    {:ok, session} = Session.start_link url: url(), username: username(),
                                        password: password(),
                                        mission_id: mission_id()

    s_url    = session |> Session.url
    s_cookie = session |> Session.cookie

    assert is_binary(s_url)
    assert is_binary(s_cookie)

    {:ok, odlcs} = Request.get_odlcs s_url, s_cookie, mission_id()
    start_len = length odlcs

    {:ok, _} = Request.post_odlc s_url, s_cookie, %{type: "OFF_AXIS"}, \
                                 mission_id()

    {:ok, odlcs} = Request.get_odlcs s_url, s_cookie, mission_id()
    end_len = length odlcs

    assert end_len === start_len + 1
  end

  test "the session can be given a name" do
    {:ok, _} = Session.start_link url: url(), username: username(),
                                  password: password(),
                                  mission_id: mission_id(), name: :test

    s_url    = :test |> Session.url
    s_cookie = :test |> Session.cookie

    assert is_binary(s_url)
    assert is_binary(s_cookie)

    {:ok, _} = Request.post_telemetry s_url, s_cookie, %{
      latitude: 1, longitude: 2, altitude: 3, heading: 4
    }
  end

  test "the default session was created" do
    s_url    = Session.url
    s_cookie = Session.cookie

    assert is_binary(s_url)
    assert is_binary(s_cookie)

    {:ok, _mission} = Request.get_mission s_url, s_cookie, mission_id()
  end
end
