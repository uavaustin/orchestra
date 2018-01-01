defmodule InteropProxy.Application do
  use Application

  def start(_type, _args) do
    session_opts = [
      url:      Application.get_env(:interop_proxy, :url),
      username: Application.get_env(:interop_proxy, :username),
      password: Application.get_env(:interop_proxy, :password),
      name:     InteropProxy.Session
    ]

    children = [
      {InteropProxy.Session, session_opts}
    ]

    opts = [strategy: :one_for_one, name: InteropProxy.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
