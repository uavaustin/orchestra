defmodule InteropProxyWeb.ObstaclesController do
  use InteropProxyWeb, :controller

  def index(conn, _params) do
    message = InteropProxy.get_obstacles!
    |> form_message(Obstacles)

    conn
    |> send_message(message)
  end
end
