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

  test "stationary obstacles have a height, but no altitude", %{conn: conn} do
    response = conn
    |> get(obstacles_path(conn, :index))
    |> protobuf_response(Obstacles)

    Enum.each response.stationary, fn obs ->
      assert is_float(obs.height)
      refute Map.has_key?(obs.pos, :alt_msl)
    end
  end

  test "moving obstacles have an altitude, but no height", %{conn: conn} do
    response = conn
    |> get(obstacles_path(conn, :index))
    |> protobuf_response(Obstacles)

    Enum.each response.moving, fn obs ->
      assert is_float(obs.pos.alt_msl)
      refute Map.has_key?(obs, :height)
    end
  end
end
