defmodule InteropProxy.Application do
  use Application

  def start(_type, _args) do
    # TODO: list all child processes to be supervised
    children = [ ]

    opts = [strategy: :one_for_one, name: InteropProxy.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
