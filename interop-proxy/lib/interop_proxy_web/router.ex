defmodule InteropProxyWeb.Router do
  use InteropProxyWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", InteropProxyWeb do
    pipe_through :api

    get "/mission", MissionController, :index
    get "/obstacles", ObstaclesController, :index
  end
end
