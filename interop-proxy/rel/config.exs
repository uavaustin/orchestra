use Mix.Releases.Config,
    default_release: :default,
    default_environment: Mix.env()

environment :prod do
  set include_erts: true
  set include_src: false
end

release :interop_proxy do
  set version: current_version(:interop_proxy)
end

