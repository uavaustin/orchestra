defmodule InteropProxyWeb.AliveController do
  use InteropProxyWeb, :controller

  def index(conn, _params) do
    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(201, "What's up?\n")
  end
end
