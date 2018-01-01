defmodule InteropProxyWeb do
  @moduledoc """
  Entrypoint for the API to send requests to the interop server.
  
  The definitions here are used in other files to keep them a little
  shorter.
  """

  def controller do
    quote do
      use Phoenix.Controller, namespace: InteropProxyWeb

      import Plug.Conn
      import InteropProxyWeb.Router.Helpers
    end
  end

  def view do
    quote do
      use Phoenix.View,
        root: "lib/interop_proxy_web/templates",
        namespace: InteropProxyWeb

      import InteropProxyWeb.Router.Helpers
    end
  end

  def router do
    quote do
      use Phoenix.Router

      import Plug.Conn
      import Phoenix.Controller
    end
  end

  def channel do
    quote do
      use Phoenix.Channel
    end
  end

  @doc """
  Use the correct controller, view, etc.
  """
  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
