defmodule InteropProxy.SessionTest do
  use ExUnit.Case

  alias InteropProxy.Request
  alias InteropProxy.Session
  alias InteropProxy.TestHelper

  import TestHelper, only: [url: 0, username: 0, password: 0]

  test "after starting a session, the cookie can be used for more requests" do
    {:ok, session} = Session.start_link url: url(), username: username(),
                                        password: password()

    s_url    = session |> Session.url
    s_cookie = session |> Session.cookie

    assert is_binary(s_url)
    assert is_binary(s_cookie)

    {:ok, odlcs} = Request.get_odlcs s_url, s_cookie
    start_len = length odlcs

    {:ok, _} = Request.post_odlc s_url, s_cookie, %{type: "off_axis"}

    {:ok, odlcs} = Request.get_odlcs s_url, s_cookie
    end_len = length odlcs

    assert end_len === start_len + 1
  end

  test "the session can be given a name" do
    {:ok, _} = Session.start_link url: url(), username: username(),
                                  password: password(), name: :test

    s_url    = :test |> Session.url
    s_cookie = :test |> Session.cookie

    assert is_binary(s_url)
    assert is_binary(s_cookie)

    {:ok, _} = Request.post_telemetry s_url, s_cookie, %{
      latitude: 1, longitude: 2, altitude_msl: 3, uas_heading: 4
    }
  end

  test "the default session was created" do
    s_url    = Session.url
    s_cookie = Session.cookie

    assert is_binary(s_url)
    assert is_binary(s_cookie)

    {:ok, missions} = Request.get_missions s_url, s_cookie

    assert length(missions) === 1
  end
end
