defmodule InteropProxyWeb.AliveControllerTest do
  use InteropProxyWeb.ConnCase, async: true

  test "returns some text", %{conn: conn} do
    response = conn
    |> get(alive_path(conn, :index))
    |> text_response(200)

    assert response === "What's up?\n"
  end
end
