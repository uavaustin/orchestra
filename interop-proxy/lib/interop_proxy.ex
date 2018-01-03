defmodule InteropProxy do
  @moduledoc """
  Entrypoint for the Interop Proxy service.

  This service wraps the behavior of the AUVSI SUAS Interoperability
  Server for use from other services in the stack.
  """

  alias InteropProxy.Request
  alias InteropProxy.Sanitize

  import InteropProxy.Session, only: [url: 0, cookie: 0]

  @doc """
  Return the active mission on the server.
  """
  def get_active_mission! do
    {:ok, missions} = Request.get_missions url(), cookie()

    missions
    |> Enum.find(fn mission -> mission["active"] === true end)
    |> Sanitize.sanitize_mission
  end

  @doc """
  Return the stationary and moving obstacles on the server.
  """
  def get_obstacles! do
    {:ok, obstacles} = Request.get_obstacles url(), cookie()

    obstacles
    |> Sanitize.sanitize_obstacles
  end
end
