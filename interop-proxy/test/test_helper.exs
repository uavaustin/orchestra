ExUnit.start()

defmodule InteropProxy.TestHelper do
  def url,      do: Application.get_env(:interop_proxy, :url)
  def username, do: Application.get_env(:interop_proxy, :username)
  def password, do: Application.get_env(:interop_proxy, :password)

  def get_image(name) do
    Path.join([__DIR__, "data", name])
    |> Path.absname
    |> File.read!
  end
end
