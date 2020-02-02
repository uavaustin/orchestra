defmodule InteropProxyTest do
  use ExUnit.Case

  alias InteropProxy.Message.Interop.{
    Position, AerialPosition, InteropTelem, Odlc
  }

  alias InteropProxy.TestHelper

  import InteropProxy

  test "get the mission" do
    mission = get_mission!()

    assert mission.current_mission === true
    assert is_float(mission.air_drop_pos.lat)
  end

  test "get stationary obstacles" do
    obs = get_obstacles!()

    assert is_list(obs.stationary)

    assert is_float(Enum.at(obs.stationary, 0).pos.lat)
  end

  test "post valid telemetry" do
    telem = %InteropTelem{
      pos: %AerialPosition{
        lat: 30,
        lon: 60,
        alt_msl: 100
      },
      yaw: 77
    }

    message = post_telemetry!(telem)

    assert is_binary(message.text)
  end

  test "posting a new odlc" do
    odlc = %Odlc{type: :STANDARD, orientation: :NORTHWEST}

    count_matching = fn ->
      Enum.count get_odlcs!().list, fn odlc ->
        match?(%{type: :STANDARD, orientation: :NORTHWEST}, odlc)
      end
    end

    # Getting the count for reference.
    starting_count = count_matching.()

    # Posting a new odlc.
    %{time: time, id: id} = post_odlc!(odlc)

    assert is_float(time)
    assert is_integer(id)

    assert count_matching.() - starting_count === 1
  end

  test "post a new odlc with an image" do
    image_1 = TestHelper.get_image "image-1.jpg"

    odlc = %Odlc{type: :STANDARD, image: image_1}

    count_matching = fn ->
      Enum.count get_odlcs!().list, &match?(%{type: :STANDARD}, &1)
    end

    # Getting the count for reference.
    starting_count = count_matching.()

    # Posting a new odlc.
    %{time: time, id: id} = post_odlc!(odlc)

    assert is_float(time)
    assert is_integer(id)

    assert count_matching.() - starting_count === 1

    # If we didn't request an image it shouldn't be returned.
    odlc_from_all = get_odlcs!().list
    |> Enum.find(fn odlc -> odlc.id === id end)

    assert odlc_from_all.image === <<>>
    assert get_odlc!(id).image === <<>>

    # If we did request it, it should be returned.
    odlc_from_all = get_odlcs!(image: true).list
    |> Enum.find(fn odlc -> odlc.id === id end)

    assert odlc_from_all.image === image_1
    assert get_odlc!(id, image: true).image === image_1
  end

  test "post and update a new odlc, once with an image" do
    image_1 = TestHelper.get_image "image-1.jpg"
    image_2 = TestHelper.get_image "image-2.jpg"

    # Posting a new odlc.
    %{id: id} = post_odlc! %Odlc{
      type: :OFF_AXIS, shape: :SQUARE, background_color: :RED, image: image_1
    }

    # Updating it.
    returned = put_odlc! id, %Odlc{
      type: :OFF_AXIS, background_color: :BLUE, orientation: :SOUTH
    }

    # Since we're using structs, the default value of shape will be
    # passed, so when updating, the shape should be gone, but the
    # image shouldn't change.
    assert returned.shape === :UNKNOWN_SHAPE
    assert returned.background_color === :BLUE
    assert returned.orientation === :SOUTH

    assert get_odlc!(id, image: true).image === image_1

    # Updating it with an image as well.
    returned = put_odlc! id, %Odlc{type: :OFF_AXIS, image: image_2}

    assert returned.shape === :UNKNOWN_SHAPE
    assert returned.background_color === :UNKNOWN_COLOR
    assert returned.orientation === :UNKNOWN_ORIENTATION

    assert get_odlc!(id, image: true).image === image_2
  end

  test "post a new odlc, then delete it" do
    starting_count = length get_odlcs!().list

    # Posting a new odlc.
    %{id: id} = post_odlc! %Odlc{
      type: :EMERGENT, pos: %Position{lat: 1, lon: 2}
    }

    assert starting_count + 1 === length get_odlcs!().list

    # Updating it.
    delete_odlc! id

    assert starting_count === length get_odlcs!().list
  end

  test "post an odlc with an invalid image" do
    error_1 = TestHelper.get_image "error.jpg"

    # Post an image with an incorrect image format.
    %{id: id} = post_odlc! %Odlc{
      type: :STANDARD, image: error_1
    }

    error_msg = get_odlc(id, image: true)

    # Make sure odlc is deleted when image submission fails.
    {:error, {:message, status, _msg}} = error_msg
    assert status === 404
  end
end
