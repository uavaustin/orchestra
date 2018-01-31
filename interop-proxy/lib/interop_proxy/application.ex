defmodule InteropProxy.Application do
  use Application

  @doc """
  Starts the Interop Proxy Application.

  Note that first a connection to the interop server will be
  established, after that, we'll start serving the endpoints.
  """
  def start(_type, _args) do
    start_session_sup()
    start_endpoint_sup()
  end

  defp start_session_sup() do
    session_opts = [
      url:        Application.get_env(:interop_proxy, :url),
      username:   Application.get_env(:interop_proxy, :username),
      password:   Application.get_env(:interop_proxy, :password),
      name:       InteropProxy.Session,
      respond_to: self()
    ]

    children = [{InteropProxy.Session, session_opts}]

    Supervisor.start_link children, strategy: :one_for_one,
                                    name: InteropProxy.SessionSupervisor

    # The session hasn't started until the connection has been made.
    receive do
      :ok -> IO.puts "Connection to the interop server has been established."
    end
  end

  defp start_endpoint_sup() do
    import Supervisor.Spec

    children = [supervisor(InteropProxyWeb.Endpoint, [])]
    
    Supervisor.start_link children, strategy: :one_for_one,
                                    name: InteropProxy.EndpointSupervisor
  end
end
