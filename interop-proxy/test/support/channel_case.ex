defmodule HelloWeb.ChannelCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      use Phoenix.ChannelTest

      @endpoint HelloWeb.Endpoint
    end
  end

  setup _tags do
    :ok
  end
end
