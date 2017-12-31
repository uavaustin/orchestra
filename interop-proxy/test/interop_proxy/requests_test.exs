defmodule InteropProxy.RequestsTest do
  use ExUnit.Case

  alias InteropProxy.Requests
  alias InteropProxy.TestHelper

  import TestHelper, only: [url: 0, username: 0, password: 0]

  test "log in successfully" do
    {:ok, _, cookie} = Requests.login url(), username(), password()

    assert is_binary(cookie)
  end

  test "get all missions" do
    {:ok, _, cookie} = Requests.login url(), username(), password()

    {:ok, missions} = Requests.get_missions url(), cookie

    assert Enum.at(missions, 0)["active"] === true
  end

  test "get one mission" do
    {:ok, _, cookie} = Requests.login url(), username(), password()

    {:ok, mission} = Requests.get_mission url(), cookie, 1

    assert mission["active"] === true
  end

  test "get moving and stationary obstacles" do
    {:ok, _, cookie} = Requests.login url(), username(), password()

    {:ok, obstacles_1} = Requests.get_obstacles url(), cookie

    # Should be two types of obstacles.
    assert obstacles_1 |> Map.keys |> length === 2

    mov_1  = obstacles_1["moving_obstacles"]
    stat_1 = obstacles_1["stationary_obstacles"]

    # Both type of obstacles should have 4 keys.
    assert mov_1 |> Enum.at(0) |> Map.keys |> length === 4
    assert stat_1 |> Enum.at(0) |> Map.keys |> length === 4

    # Sleep a little and request again, the moving ones should have
    # changed, but the stationary should be the same.
    Process.sleep(100)

    {:ok, obstacles_2} = Requests.get_obstacles url(), cookie

    mov_2  = obstacles_2["moving_obstacles"]
    stat_2 = obstacles_2["stationary_obstacles"]

    assert mov_1 !== mov_2
    assert stat_1 === stat_2 
  end

  test "post valid telemetry" do
    {:ok, _, cookie} = Requests.login url(), username(), password()

    {:ok, _} = Requests.post_telemetry url(), cookie, %{
      latitude: 30.3, longitude: 33.3, altitude_msl: 4, uas_heading: 22.9
    }

    {:ok, _} = Requests.post_telemetry url(), cookie, %{
      latitude: 30, longitude: 33, altitude_msl: 4.444444, uas_heading: 359.9
    }
  end

  test "add a new odlc, retrieve it, and add an image to it" do
    {:ok, _, cookie} = Requests.login url(), username(), password()

    # Posting a new odlc.
    {:ok, uploaded} = Requests.post_odlc url(), cookie, %{
      "type" => "standard", "latitude" => 12.345, "longitude" => 34.567
    }

    assert uploaded["type"] === "standard"
    assert uploaded["latitude"] === 12.345
    assert uploaded["longitude"] === 34.567

    id = uploaded["id"]

    # Make sure the image is the same when we get it.
    {:ok, retrieved} = Requests.get_odlc url(), cookie, id

    assert uploaded === retrieved

    # Adding the image to it.
    image_1 = TestHelper.get_image "image-1.png"

    {:ok, _} = Requests.post_odlc_image url(), cookie, id, image_1

    # Check the uploaded image.
    {:ok, uploaded_image} = Requests.get_odlc_image url(), cookie, id

    assert uploaded_image === image_1
  end

  test "add a new odlc and delete it" do
    {:ok, _, cookie} = Requests.login url(), username(), password()

    # Posting a new odlc.
    {:ok, uploaded} = Requests.post_odlc url(), cookie, %{
      type: "standard", shape: "semicircle", color: "red", alphanumeric: "Y",
      alphanumeric_color: "green", autonomous: true
    }

    id = uploaded["id"]

    # Using a reference amount of uploaded odlcs.
    {:ok, all_odlc} = Requests.get_odlcs url(), cookie

    starting_count = length all_odlc

    # Deleting it now.
    {:ok, _} = Requests.delete_odlc url(), cookie, id

    # Make sure the total odlcs decreased by one.
    {:ok, all_odlc} = Requests.get_odlcs url(), cookie

    end_count = length all_odlc

    assert end_count === starting_count - 1
  end

  test "add an off axis and emergent odlc" do
    {:ok, _, cookie} = Requests.login url(), username(), password()

    # Getting the reference count (in case the interop server was not
    # newly created).
    get_count = fn ->
      {:ok, all_odlc} = Requests.get_odlcs url(), cookie

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

    {:ok, %{"id" => id_1}} = Requests.post_odlc url(), cookie, %{
      type: "off_axis", latitude: 12.345, longitude: 34.567
    }

    image_2 = TestHelper.get_image "image-2.png"

    {:ok, _} = Requests.post_odlc_image url(), cookie, id_1, image_2

    {:ok, %{"id" => id_2}} = Requests.post_odlc url(), cookie, %{
      type: "emergent", latitude: -12.345, longitude: -34.567,
      description: "Fireman"
    }

    image_3 = TestHelper.get_image "image-3.png"

    {:ok, _} = Requests.post_odlc_image url(), cookie, id_2, image_3

    # Make sure both were uploaded.
    {end_oa, end_e} = get_count.()

    assert end_oa === start_oa + 1
    assert end_e  === start_e  + 1
  end

  test "add an odlc and then update it" do
    {:ok, _, cookie} = Requests.login url(), username(), password()

    # Posting a new odlc.
    {:ok, %{"id" => id}} = Requests.post_odlc url(), cookie, %{
      "type" => "standard", "latitude" => 12.345, "longitude" => 34.567
    }

    # Updating it.
    {:ok, odlc} = Requests.put_odlc url(), cookie, id, %{
      "type" => "standard", "latitude" => -12.345, "longitude" => -34.567
    }

    # Checking that the contents were updated.
    %{
      "type" => "standard", "latitude" => -12.345, "longitude" => -34.567
    } = odlc

    {:ok, odlc} = Requests.get_odlc url(), cookie, id

    %{
      "type" => "standard", "latitude" => -12.345, "longitude" => -34.567
    } = odlc
  end

  test "add an odlc with an image and then update and delete the image" do
    {:ok, _, cookie} = Requests.login url(), username(), password()

    # Posting a new odlc.
    {:ok, %{"id" => id}} = Requests.post_odlc url(), cookie, %{
      "type" => "standard", "latitude" => 12.345, "longitude" => 34.567
    }

    # Adding the image to it, then changing it.
    image_1 = TestHelper.get_image "image-1.png"
    image_2 = TestHelper.get_image "image-2.png"

    {:ok, _} = Requests.post_odlc_image url(), cookie, id, image_1
    {:ok, _} = Requests.put_odlc_image url(), cookie, id, image_2

    # Check the revised image.
    {:ok, revised_image} = Requests.get_odlc_image url(), cookie, id

    assert revised_image === image_2

    # Deleting the image.
    {:ok, _} = Requests.delete_odlc_image url(), cookie, id

    # Making sure the image doesn't exist.
    {:ok, image} = Requests.get_odlc_image url(), cookie, id

    assert image === nil
  end
end
