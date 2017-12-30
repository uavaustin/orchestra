defmodule InteropProxy.Mixfile do
  use Mix.Project

  def project do
    [
      app: :interop_proxy,
      version: "0.1.0",
      elixir: "~> 1.5",
      start_permanent: Mix.env == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: list_apps(Mix.env),
      mod: {InteropProxy.Application, []}
    ]
  end

  defp list_apps(:prod), do: [:flasked] ++ list_apps(:dev)
  defp list_apps(_env), do: [:logger, :httpoison]

  defp deps do
    [
      {:flasked, "~> 0.4.0", only: :prod},
      {:httpoison, "~> 0.13.0"},
      {:poison, "~> 3.1.0"}
    ]
  end
end
