defmodule InteropProxy.Session do
  @moduledoc """
  Keeps an internal state with the url and cookie for requests.

  Will also keep making sure the login is valid every 5 seconds. If
  the cookie no longer works, because for example, a new server was
  created, the cookie would be updated.
  """

  use Agent

  alias InteropProxy.Request

  @doc """
  Log in and then start the Session Agent.

  If the `:respond_to` keyword argument is supplied in `opts`, we'll
  send an `:ok` message when we've connected successfully.
  """
  def start_link(opts) do
    url      = Keyword.fetch! opts, :url
    username = Keyword.fetch! opts, :username
    password = Keyword.fetch! opts, :password

    resp = Keyword.get opts, :respond_to, nil

    other_opts = Keyword.drop opts, [:url, :username, :password, :respond_to]

    {^url, cookie} = do_login url, username, password

    if resp !== nil, do: send resp, :ok

    {:ok, pid} = Agent.start_link fn -> %{
      url: url, cookie: cookie, username: username, password: password
    } end, other_opts

    spawn_link fn -> monitor_cookie pid, url, username, password end

    {:ok, pid}
  end

  # Log in, if we couldn't log in, just keep trying.
  defp do_login(url, username, password) do
    case Request.login url, username, password do
      {:ok, _, cookie} ->
        {url, cookie}
      _ ->
        IO.puts "Interop server could not be reached... trying again."
        Process.sleep 500

        do_login url, username, password
    end
  end

  # Keep checking if the cookie is still valid, if it's not, make a
  # new one for the session.
  defp monitor_cookie(session, url, username, password) do
    Process.sleep 5000

    case Request.get_obstacles url, cookie(session) do
      {:error, :forbidden} ->
        {^url, cookie} = do_login url, username, password
        Agent.update session, &Map.put(&1, :cookie, cookie)
      _ ->
        nil
    end

    monitor_cookie session, url, username, password
  end

  @doc """
  Get the url used in the login.
  """
  def url(session \\ __MODULE__) do
    Agent.get session, &Map.get(&1, :url)
  end

  @doc """
  Get the cookie from the login.
  """
  def cookie(session \\ __MODULE__) do
    Agent.get session, &Map.get(&1, :cookie)
  end
end
