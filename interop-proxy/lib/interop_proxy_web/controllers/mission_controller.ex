defmodule InteropProxyWeb.MissionController do
  use InteropProxyWeb, :controller

  def index(conn, _params) do
    message = InteropProxy.get_active_mission!
    |> form_message(Mission)    

    conn
    |> send_message(message)
  end
end
