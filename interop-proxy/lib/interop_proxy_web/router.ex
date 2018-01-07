defmodule InteropProxyWeb.Router do
  use InteropProxyWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/api", InteropProxyWeb do
    pipe_through :api

    get "/mission", MissionController, :index
    get "/obstacles", ObstaclesController, :index
    post "/telemetry", TelemetryController, :create
    
    get "/odlcs", OdlcController, :index
    get "/odlcs/:id", OdlcController, :show
    post "/odlcs",  OdlcController, :create
    put "/odlcs/:id", OdlcController, :update
    delete "/odlcs/:id", OdlcController, :delete
  end
end
