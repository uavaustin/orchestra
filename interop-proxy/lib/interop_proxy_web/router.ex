defmodule InteropProxyWeb.Router do
  use InteropProxyWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", InteropProxyWeb do
    pipe_through :api
  end
end
