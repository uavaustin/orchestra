defmodule InteropProxy.Session do
  @moduledoc """
  Keeps an internal state with the url and cookie for requests.
  """

  use Agent

  alias InteropProxy.Request

  @doc """
  Log in and then start the Session Agent.
  """
  def start_link(url, username, password, opts \\ []) do
    Agent.start_link __MODULE__, :start_fun, [url, username, password], opts
  end

  @doc """
  Function called when starting the Agent.
  """
  def start_fun(url, username, password) do
    {:ok, _, cookie} = Request.login url, username, password
    {url, cookie}
  end

  @doc """
  Get the url used in the login.
  """
  def url(session) do
    Agent.get session, fn {url, _} -> url end
  end

  @doc """
  Get the cookie from the login.
  """
  def cookie(session) do
    Agent.get session, fn {_, cookie} -> cookie end
  end
end
