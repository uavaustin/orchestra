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
      extra_applications: [
        :flasked, :logger, :runtime_tools, :httpoison, :exprotobuf
      ],
      mod: {InteropProxy.Application, []}
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_),     do: ["lib"]

  defp deps do
    [
      {:cowboy, "~> 1.0"},
      {:distillery, "~> 1.3", runtime: false},
      {:exprotobuf, "~> 1.2.9"},
      {:flasked, "~> 0.4.0"},
      {:httpoison, "~> 0.13.0"},
      {:phoenix, "~> 1.3.0"},
      {:phoenix_pubsub, "~> 1.0"},
      {:plug_cowboy, "~> 1.0"},
      {:poison, "~> 3.1.0"}
    ]
  end
end
