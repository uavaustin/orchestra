defmodule InteropProxyWeb.Router do
  use InteropProxyWeb, :router

  pipeline :api do
    plug :accepts, ["protobuf", "json"]
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
    get "teams", TeamsController, :index

    get "/alive", AliveController, :index
  end
end
