defmodule InteropProxyWeb.TeamsController do
  use InteropProxyWeb, :controller

  def index(conn, _params) do
    send_message conn, InteropProxy.get_teams
  end
end
