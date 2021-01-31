defmodule InteropProxyWeb.OdlcControllerTest do
  use InteropProxyWeb.ConnCase, async: true

  alias InteropProxy.Message.Interop.{Position, Odlc, OdlcList, InteropMessage}

  alias InteropProxy.TestHelper

  import InteropProxy

  describe "index/2" do
    setup _context do
      image_2 = TestHelper.get_image "image-2.jpg"

      odlc = post_odlc! %Odlc{
        type: :OFF_AXIS,
        pos: %Position{lat: 60, lon: 50},
        image: image_2
      }

      {:ok, id: odlc.id, image: image_2}
    end

    test "can get a list in a protobuf", context do
      response = context.conn
      |> get(odlc_path(context.conn, :index))
      |> protobuf_response(OdlcList)

      odlc = Enum.find response.list, &(&1.id === context.id)

      assert odlc.type === :OFF_AXIS
      assert odlc.pos.lat == 60
      assert odlc.pos.lon == 50
      assert odlc.image === <<>>
    end

    test "can get a list with images in a protobuf", context do
      response = context.conn
      |> get(odlc_path(context.conn, :index, image: "true"))
      |> protobuf_response(OdlcList)

      odlc = Enum.find response.list, &(&1.id === context.id)

      assert odlc.type === :OFF_AXIS
      assert odlc.pos.lat == 60
      assert odlc.pos.lon == 50
      assert odlc.image === context.image
    end

    test "can get a list as JSON", context do
      response = context.conn
      |> put_req_header("accept", "application/json")
      |> get(odlc_path(context.conn, :index))
      |> json_response(200)

      odlc = Enum.find response["list"], &(&1["id"] === context.id)

      assert odlc["type"] === "OFF_AXIS"
      assert odlc["pos"]["lat"] == 60
      assert odlc["pos"]["lon"] == 50
      assert odlc["image"] === <<>>
    end

    test "can get a list with images as JSON", context do
      response = context.conn
      |> put_req_header("accept", "application/json")
      |> get(odlc_path(context.conn, :index, image: "true"))
      |> json_response(200)

      odlc = Enum.find response["list"], &(&1["id"] === context.id)

      assert odlc["type"] === "OFF_AXIS"
      assert odlc["pos"]["lat"] == 60
      assert odlc["pos"]["lon"] == 50
      assert odlc["image"] === Base.encode64(context.image)
    end
  end

  describe "show/2" do
    setup _context do
      image_3 = TestHelper.get_image "image-3.jpg"

      odlc = post_odlc! %Odlc{
        type: :EMERGENT,
        description: "fireman",
        pos: %Position{lat: 61, lon: 51},
        image: image_3
      }

      {:ok, id: odlc.id, image: image_3}
    end

    test "can get an odlc in a protobuf", context do
      response = context.conn
      |> get(odlc_path(context.conn, :show, context.id))
      |> protobuf_response(Odlc)

      assert response.type === :EMERGENT
      assert response.description === "fireman"
      assert response.pos.lat == 61
      assert response.pos.lon == 51
      assert response.image === <<>>
    end

    test "can get an odlc with an image in a protobuf", context do
      response = context.conn
      |> get(odlc_path(context.conn, :show, context.id, image: "true"))
      |> protobuf_response(Odlc)

      assert response.type === :EMERGENT
      assert response.description === "fireman"
      assert response.pos.lat == 61
      assert response.pos.lon == 51
      assert response.image === context.image
    end

    test "can get an odlc as JSON", context do
      response = context.conn
      |> put_req_header("accept", "application/json")
      |> get(odlc_path(context.conn, :show, context.id))
      |> json_response(200)

      assert response["type"] === "EMERGENT"
      assert response["description"] === "fireman"
      assert response["pos"]["lat"] == 61
      assert response["pos"]["lon"] == 51
      assert response["image"] === <<>>
    end

    test "can get an odlc with an image as JSON", context do
      response = context.conn
      |> put_req_header("accept", "application/json")
      |> get(odlc_path(context.conn, :show, context.id, image: "true"))
      |> json_response(200)

      assert response["type"] === "EMERGENT"
      assert response["description"] === "fireman"
      assert response["pos"]["lat"] == 61
      assert response["pos"]["lon"] == 51
      assert response["image"] === Base.encode64(context.image)
    end
  end

  describe "create/2" do
    setup _context do
      image_2 = TestHelper.get_image "image-2.jpg"

      {:ok, image: image_2}
    end

    test "post new odlc in a protobuf, get it back in a protobuf", context do
      response = context.conn
      |> put_req_header("content-type", "application/x-protobuf")
      |> post(odlc_path(context.conn, :create), %Odlc{
        type: :OFF_AXIS,
        shape: :RECTANGLE,
        pos: %Position{lat: -1, lon: 1}
      } |> Odlc.encode)
      |> protobuf_response(Odlc)

      assert response.type === :OFF_AXIS
      assert response.shape === :RECTANGLE
      assert response.pos.lat == -1
      assert response.pos.lon == 1
      assert response.image === <<>>
    end

    test "post new odlc and image in a protobuf, get it back in a protobuf",
        context do
      response = context.conn
      |> put_req_header("content-type", "application/x-protobuf")
      |> post(odlc_path(context.conn, :create), %Odlc{
        type: :OFF_AXIS,
        shape: :TRAPEZOID,
        image: context.image
      } |> Odlc.encode)
      |> protobuf_response(Odlc)

      assert response.type === :OFF_AXIS
      assert response.shape === :TRAPEZOID
      assert response.image === <<>>
    end

    test "post new odlc as JSON, get it back as JSON", context do
      response = context.conn
      |> put_req_header("accept", "application/json")
      |> put_req_header("content-type", "application/json")
      |> post(odlc_path(context.conn, :create), %{
        type: "OFF_AXIS",
        shape: "RECTANGLE",
        pos: %{lat: -1, lon: 1}
      })
      |> json_response(200)

      assert response["type"] === "OFF_AXIS"
      assert response["shape"] === "RECTANGLE"
      assert response["pos"]["lat"] == -1
      assert response["pos"]["lon"] == 1
      assert response["image"] === <<>>
    end

    test "post new odlc and image as JSON, get it back as JSON",
        context do
      response = context.conn
      |> put_req_header("accept", "application/json")
      |> put_req_header("content-type", "application/json")
      |> post(odlc_path(context.conn, :create), %{
        type: "OFF_AXIS",
        shape: "TRAPEZOID",
        image: Base.encode64(context.image) 
      })
      |> json_response(200)

      assert response["type"] === "OFF_AXIS"
      assert response["shape"] === "TRAPEZOID"
      assert response["image"] === <<>>
    end
  end

  describe "update/2" do
    setup _context do
      image = TestHelper.get_image "image-1.jpg"
      odlc = post_odlc! %Odlc{type: :STANDARD}

      {:ok, id: odlc.id, image: image}
    end

    test "update odlc with a protobuf, get it back in a protobuf", context do
      response = context.conn
      |> put_req_header("content-type", "application/x-protobuf")
      |> put(odlc_path(context.conn, :update, context.id), %Odlc{
        type: :STANDARD,
        shape: :SQUARE,
        orientation: :WEST
      } |> Odlc.encode)
      |> protobuf_response(Odlc)

      assert response.shape === :SQUARE
      assert response.orientation === :WEST
      assert response.image === <<>>
    end

    test "update odlc and image with a protobuf, get it back in a protobuf",
        context do
      response = context.conn
      |> put_req_header("content-type", "application/x-protobuf")
      |> put(odlc_path(context.conn, :update, context.id), %Odlc{
        type: :STANDARD,
        shape: :SQUARE,
        background_color: :RED,
        alphanumeric_color: :WHITE,
        alphanumeric: "Z",
        image: context.image
      } |> Odlc.encode)
      |> protobuf_response(Odlc)

      assert response.shape === :SQUARE
      assert response.background_color === :RED
      assert response.alphanumeric_color === :WHITE
      assert response.alphanumeric === "Z"
      assert response.image === <<>>
    end

    test "update odlc with JSON, get it back as JSON", context do
      response = context.conn
      |> put_req_header("accept", "application/json")
      |> put_req_header("content-type", "application/json")
      |> put(odlc_path(context.conn, :update, context.id), %{
        type: "STANDARD",
        shape: "SQUARE",
        orientation: "WEST"
      })
      |> json_response(200)

      assert response["shape"] === "SQUARE"
      assert response["orientation"] === "WEST"
      assert response["image"] === <<>>
    end

    test "update odlc and image with JSON, get it back as JSON", context do
      response = context.conn
      |> put_req_header("accept", "application/json")
      |> put_req_header("content-type", "application/json")
      |> put(odlc_path(context.conn, :update, context.id), %{
        type: "STANDARD",
        shape: "SQUARE",
        background_color: "RED",
        alphanumeric_color: "WHITE",
        alphanumeric: "Z",
        image: Base.encode64(context.image)
      })
      |> json_response(200)

      assert response["shape"] === "SQUARE"
      assert response["background_color"] === "RED"
      assert response["alphanumeric_color"] === "WHITE"
      assert response["alphanumeric"] === "Z"
      assert response["image"] === <<>>
    end
  end

  describe "delete/2" do
    setup _context do
      odlc_1 = post_odlc! %Odlc{type: :OFF_AXIS}
      odlc_2 = post_odlc! %Odlc{type: :EMERGENT}

      {:ok, id_1: odlc_1.id, id_2: odlc_2.id}
    end

    test "delete an odlc, get message in a protobuf", context do
      response = context.conn
      |> delete(odlc_path(context.conn, :delete, context.id_1))
      |> protobuf_response(InteropMessage)

      assert is_binary(response.text)
      assert response.text |> String.length > 0
    end

    test "delete an odlc, get message as JSON", context do
      response = context.conn
      |> put_req_header("accept", "application/json")
      |> delete(odlc_path(context.conn, :delete, context.id_2))
      |> json_response(200)

      assert is_binary(response["text"])
      assert response["text"] |> String.length > 0
    end
  end
end
