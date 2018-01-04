defmodule InteropProxy.Session do
  @moduledoc """
  Keeps an internal state with the url and cookie for requests.
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

    Agent.start_link fn -> {url, cookie} end, other_opts
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

  @doc """
  Get the url used in the login.
  """
  def url(session \\ __MODULE__) do
    Agent.get session, fn {url, _} -> url end
  end

  @doc """
  Get the cookie from the login.
  """
  def cookie(session \\ __MODULE__) do
    Agent.get session, fn {_, cookie} -> cookie end
  end
end
