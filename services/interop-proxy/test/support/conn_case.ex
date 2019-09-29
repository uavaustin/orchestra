defmodule InteropProxyWeb.ConnCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      use Phoenix.ConnTest

      import InteropProxyWeb.Router.Helpers

      @endpoint InteropProxyWeb.Endpoint

      def protobuf_response(conn, status_code \\ 201, module) do
        content_type = get_resp_header conn, "content-type"
        resp = response conn, status_code

        assert content_type === ["application/x-protobuf"]
        module.decode resp
      end
    end
  end

  setup _tags do
    {:ok, conn: Phoenix.ConnTest.build_conn()}
  end
end
