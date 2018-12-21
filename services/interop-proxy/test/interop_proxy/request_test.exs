defmodule InteropProxy.RequestTest do
  use ExUnit.Case

  alias InteropProxy.Request
  alias InteropProxy.TestHelper

  import TestHelper, only: [url: 0, username: 0, password: 0]

  test "log in successfully" do
    {:ok, _, cookie} = Request.login url(), username(), password()

    assert is_binary(cookie)
  end

  test "get all missions" do
    {:ok, _, cookie} = Request.login url(), username(), password()

    {:ok, missions} = Request.get_missions url(), cookie

    assert Enum.at(missions, 0)["active"] === true
  end

  test "get one mission" do
    {:ok, _, cookie} = Request.login url(), username(), password()

    {:ok, mission} = Request.get_mission url(), cookie, 1

    assert mission["active"] === true
  end

  test "get stationary obstacles" do
    {:ok, _, cookie} = Request.login url(), username(), password()

    {:ok, obstacles_1} = Request.get_obstacles url(), cookie

    # Should be one type of obstacles.
    assert obstacles_1 |> Map.keys |> length === 1

    stat_1 = obstacles_1["stationary_obstacles"]

    # Stationary obstacles should have 4 keys.
    assert stat_1 |> Enum.at(0) |> Map.keys |> length === 4
  end

  test "post valid telemetry" do
    {:ok, _, cookie} = Request.login url(), username(), password()

    {:ok, _} = Request.post_telemetry url(), cookie, %{
      latitude: 30.3, longitude: 33.3, altitude_msl: 4, uas_heading: 22.9
    }

    {:ok, _} = Request.post_telemetry url(), cookie, %{
      latitude: 30, longitude: 33, altitude_msl: 4.444444, uas_heading: 359.9
    }
  end

  test "add a new odlc, retrieve it, and add an image to it" do
    {:ok, _, cookie} = Request.login url(), username(), password()

    # Posting a new odlc.
    {:ok, uploaded} = Request.post_odlc url(), cookie, %{
      "type" => "standard", "latitude" => 12.345, "longitude" => 34.567
    }

    assert uploaded["type"] === "standard"
    assert uploaded["latitude"] === 12.345
    assert uploaded["longitude"] === 34.567

    id = uploaded["id"]

    # Make sure the image is the same when we get it.
    {:ok, retrieved} = Request.get_odlc url(), cookie, id

    assert uploaded === retrieved

    # Adding the image to it.
    image_1 = TestHelper.get_image "image-1.jpg"

    {:ok, _} = Request.post_odlc_image url(), cookie, id, image_1

    # Check the uploaded image.
    {:ok, uploaded_image} = Request.get_odlc_image url(), cookie, id

    assert uploaded_image === image_1
  end

  test "add a new odlc and delete it" do
    {:ok, _, cookie} = Request.login url(), username(), password()

    # Posting a new odlc.
    {:ok, uploaded} = Request.post_odlc url(), cookie, %{
      type: "standard", shape: "semicircle", color: "red", alphanumeric: "Y",
      alphanumeric_color: "green", autonomous: true
    }

    id = uploaded["id"]

    # Using a reference amount of uploaded odlcs.
    {:ok, all_odlc} = Request.get_odlcs url(), cookie

    starting_count = length all_odlc

    # Deleting it now.
    {:ok, _} = Request.delete_odlc url(), cookie, id

    # Make sure the total odlcs decreased by one.
    {:ok, all_odlc} = Request.get_odlcs url(), cookie

    end_count = length all_odlc

    assert end_count === starting_count - 1
  end

  test "add an off axis and emergent odlc" do
    {:ok, _, cookie} = Request.login url(), username(), password()

    # Getting the reference count (in case the interop server was not
    # newly created).
    get_count = fn ->
      {:ok, all_odlc} = Request.get_odlcs url(), cookie

      off_axis_count = Enum.count(all_odlc, fn
        %{
          "type" => "off_axis", "latitude" => 12.345, "longitude" => 34.567
        } -> true
        _ -> false
      end)

      emergent_count = Enum.count(all_odlc, fn
        %{
          "type" => "emergent", "latitude" => -12.345, "longitude" => -34.567,
          "description" => "Fireman"
        } -> true
        _ -> false
      end)

      {off_axis_count, emergent_count}
    end

    {start_oa, start_e} = get_count.()

    {:ok, %{"id" => id_1}} = Request.post_odlc url(), cookie, %{
      type: "off_axis", latitude: 12.345, longitude: 34.567
    }

    image_2 = TestHelper.get_image "image-2.jpg"

    {:ok, _} = Request.post_odlc_image url(), cookie, id_1, image_2

    {:ok, %{"id" => id_2}} = Request.post_odlc url(), cookie, %{
      type: "emergent", latitude: -12.345, longitude: -34.567,
      description: "Fireman"
    }

    image_3 = TestHelper.get_image "image-3.jpg"

    {:ok, _} = Request.post_odlc_image url(), cookie, id_2, image_3

    # Make sure both were uploaded.
    {end_oa, end_e} = get_count.()

    assert end_oa === start_oa + 1
    assert end_e  === start_e  + 1
  end

  test "add an odlc and then update it" do
    {:ok, _, cookie} = Request.login url(), username(), password()

    # Posting a new odlc.
    {:ok, %{"id" => id}} = Request.post_odlc url(), cookie, %{
      "type" => "standard", "latitude" => 12.345, "longitude" => 34.567
    }

    # Updating it.
    {:ok, odlc} = Request.put_odlc url(), cookie, id, %{
      "type" => "standard", "latitude" => -12.345, "longitude" => -34.567
    }

    # Checking that the contents were updated.
    %{
      "type" => "standard", "latitude" => -12.345, "longitude" => -34.567
    } = odlc

    {:ok, odlc} = Request.get_odlc url(), cookie, id

    %{
      "type" => "standard", "latitude" => -12.345, "longitude" => -34.567
    } = odlc
  end

  test "add an odlc with an image and then update and delete the image" do
    {:ok, _, cookie} = Request.login url(), username(), password()

    # Posting a new odlc.
    {:ok, %{"id" => id}} = Request.post_odlc url(), cookie, %{
      "type" => "standard", "latitude" => 12.345, "longitude" => 34.567
    }

    # Adding the image to it, then changing it.
    image_1 = TestHelper.get_image "image-1.jpg"
    image_2 = TestHelper.get_image "image-2.jpg"

    {:ok, _} = Request.post_odlc_image url(), cookie, id, image_1
    {:ok, _} = Request.put_odlc_image url(), cookie, id, image_2

    # Check the revised image.
    {:ok, revised_image} = Request.get_odlc_image url(), cookie, id

    assert revised_image === image_2

    # Deleting the image.
    {:ok, _} = Request.delete_odlc_image url(), cookie, id

    # Making sure the image doesn't exist.
    {:ok, image} = Request.get_odlc_image url(), cookie, id

    assert image === <<>>
  end
end
