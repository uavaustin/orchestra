defmodule InteropProxyWeb.MissionControllerTest do
  use InteropProxyWeb.ConnCase, async: true

  alias InteropProxy.Message.Interop.InteropMission

  test "returns the current mission as a protobuf", %{conn: conn} do
    response = conn
    |> get(mission_path(conn, :index))
    |> protobuf_response(InteropMission)

    assert response.current_mission === true
  end

  test "returns the current mission as JSON", %{conn: conn} do
    response = conn
    |> put_req_header("accept", "application/json")
    |> get(mission_path(conn, :index))
    |> json_response(201)

    assert response["current_mission"] === true    
  end
end
