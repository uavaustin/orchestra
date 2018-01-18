defmodule InteropProxyWeb.OdlcController do
  use InteropProxyWeb, :controller

  plug InteropProxyWeb.Plugs.DecodeProtobuf, Odlc
  when action in [:create, :update]

  def index(conn, %{"image" => image}) do
    send_message conn, InteropProxy.get_odlcs(image: is_truthy(image))
  end

  def index(conn, _params), do: index conn, %{"image" => false}

  def show(conn, %{"id" => id, "image" => image}) do
    send_message conn, InteropProxy.get_odlc(String.to_integer(id),
                                             image: is_truthy(image))
  end

  def show(conn, %{"id" => id}), do: show conn, %{"id" => id, "image" => false}

  def create(conn, _params) do
    send_message conn, InteropProxy.post_odlc(conn.assigns.protobuf)
  end

  def update(conn, %{"id" => id}) do
    send_message conn, InteropProxy.put_odlc(String.to_integer(id),
                                             conn.assigns.protobuf)
  end

  def delete(conn, %{"id" => id}) do
    send_message conn, InteropProxy.delete_odlc(String.to_integer(id))
  end
end
