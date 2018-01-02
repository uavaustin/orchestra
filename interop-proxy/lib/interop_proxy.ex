defmodule InteropProxy do
  @moduledoc """
  Entrypoint for the Interop Proxy service.

  This service wraps the behavior of the AUVSI SUAS Interoperability
  Server for use from other services in the stack.
  """

  alias InteropProxy.Request

  import InteropProxy.Session, only: [url: 0, cookie: 0]

  @doc """
  Return the active mission on the server.

  `nil` is returned when there is none.
  """
  def get_active_mission! do
    {:ok, missions} = Request.get_missions url(), cookie()

    missions
    |> Enum.find(fn mission -> mission["active"] === true end)
  end
end
