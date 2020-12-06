defmodule InteropProxy.Mixfile do
  use Mix.Project

  def project do
    [
      app: :interop_proxy,
      version: "0.1.0",
      elixir: "~> 1.8",
      elixirc_paths: elixirc_paths(Mix.env),
      compilers: [:phoenix] ++ Mix.compilers,
      start_permanent: Mix.env == :prod,
      deps: deps(),
      test_coverage: [tool: ExCoveralls]
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
      {:cowboy, "~> 2.6"},
      {:distillery, "~> 1.3", runtime: false},
      {:exprotobuf, "~> 1.2.9"},
      {:gpb, "~> 4.12.0"},
      {:flasked, "~> 0.4.0"},
      {:httpoison, "~> 1.5"},
      {:phoenix, "~> 1.4"},
      {:phoenix_pubsub, "~> 1.1"},
      {:plug_cowboy, "~> 2.0"},
      {:poison, "~> 3.1.0"},

      {:excoveralls, "~> 0.13.3", only: :test}
    ]
  end
end
