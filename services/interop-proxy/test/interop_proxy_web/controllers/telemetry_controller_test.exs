defmodule InteropProxyWeb.TelemetryControllerTest do
  use InteropProxyWeb.ConnCase, async: true

  alias InteropProxy.Message.Interop.{
    AerialPosition, InteropTelem, InteropMessage
  }

  @test_telem %InteropTelem{
    pos: %AerialPosition{
      lat: 1,
      lon: 2,
      alt_msl: 3
    },
    yaw: 4
  }

  test "post new telemetry in a protobuf, get message in a protobuf",
      %{conn: conn} do
    response = conn
    |> put_req_header("content-type", "application/x-protobuf")
    |> post(telemetry_path(conn, :create), InteropTelem.encode(@test_telem))
    |> protobuf_response(InteropMessage)

    assert is_binary(response.text)
    assert response.text |> String.length > 0
  end

  test "post new telemetry as JSON, get message as JSON", %{conn: conn} do
    response = conn
    |> put_req_header("content-type", "application/json")
    |> put_req_header("accept", "application/json")
    |> post(telemetry_path(conn, :create), Poison.encode!(@test_telem))
    |> json_response(201)

    assert is_binary(response["text"])
    assert response["text"] |> String.length > 0
  end
end
