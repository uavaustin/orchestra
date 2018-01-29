defmodule InteropProxyWeb.ObstaclesControllerTest do
  use InteropProxyWeb.ConnCase, async: true

  alias InteropProxy.Message.Interop.Obstacles

  test "returns the current obstacles as a protobuf", %{conn: conn} do
    response = conn
    |> get(obstacles_path(conn, :index))
    |> protobuf_response(Obstacles)

    assert is_list(response.stationary)
    assert is_list(response.moving)
  end

  test "returns the current obstacles as JSON", %{conn: conn} do
    response = conn
    |> put_req_header("accept", "application/json")
    |> get(obstacles_path(conn, :index))
    |> json_response(200)

    assert is_list(response["stationary"])
    assert is_list(response["moving"])
  end
end
