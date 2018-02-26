defmodule InteropProxyWeb.ControllerHelpersTest do
  use ExUnit.Case, async: true

  alias InteropProxyWeb.ControllerHelpers

  test "is_truthy() returns true and false when expected" do
    assert ControllerHelpers.is_truthy("1")
    assert ControllerHelpers.is_truthy("true")
    assert ControllerHelpers.is_truthy("True")
    assert ControllerHelpers.is_truthy("TRUE")
    assert ControllerHelpers.is_truthy(true)

    refute ControllerHelpers.is_truthy("false")
    refute ControllerHelpers.is_truthy()
    refute ControllerHelpers.is_truthy(nil)
  end
end
