defmodule InteropProxyWeb.ObstaclesController do
  use InteropProxyWeb, :controller

  def index(conn, _params) do
    send_message conn, InteropProxy.get_obstacles!
  end
end
