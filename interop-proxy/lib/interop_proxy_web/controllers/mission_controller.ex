defmodule InteropProxyWeb.MissionController do
  use InteropProxyWeb, :controller

  def index(conn, _params) do
    send_message conn, InteropProxy.get_active_mission
  end
end
