defmodule InteropProxy.Mixfile do
  use Mix.Project

  def project do
    [
      app: :interop_proxy,
      version: "0.1.0",
      elixir: "~> 1.5",
      elixirc_paths: elixirc_paths(Mix.env),
      compilers: [:phoenix] ++ Mix.compilers,
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

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_),     do: ["lib"]

  defp list_apps(:prod), do: [:flasked] ++ list_apps(:dev)
  defp list_apps(_env), do: [:logger, :runtime_tools, :httpoison, :exprotobuf]

  defp deps do
    [
      {:cowboy, "~> 1.0"},
      {:exprotobuf, "~> 1.2.9"},
      {:flasked, "~> 0.4.0", only: :prod},
      {:httpoison, "~> 0.13.0"},
      {:phoenix, "~> 1.3.0"},
      {:phoenix_pubsub, "~> 1.0"},
      {:poison, "~> 3.1.0"}
    ]
  end
end
