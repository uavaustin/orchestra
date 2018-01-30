defmodule InteropProxy do
  @moduledoc """
  Entrypoint for the Interop Proxy service.

  This service wraps the behavior of the AUVSI SUAS Interoperability
  Server for use from other services in the stack.
  """

  alias InteropProxy.Message.Interop.{InteropTelem, Odlc}

  alias InteropProxy.Request
  alias InteropProxy.Sanitize

  import InteropProxy.Session, only: [url: 0, cookie: 0]

  @doc """
  Return the active mission on the server.
  """
  def get_active_mission do
    case Request.get_missions url(), cookie() do
      {:ok, missions} ->
        message = missions
        |> Enum.find(fn mission -> mission["active"] === true end)
        |> Sanitize.sanitize_mission

        {:ok, message}
      {:error, _} = other ->
        other
    end
  end

  @doc """
  Same as `get_active_mission/0`, but raises an exception on failure.
  """
  def get_active_mission!, do: when_ok get_active_mission()

  @doc """
  Return the stationary and moving obstacles on the server.
  """
  def get_obstacles do
    case Request.get_obstacles url(), cookie() do
      {:ok, obstacles}    -> {:ok, Sanitize.sanitize_obstacles(obstacles)}
      {:error, _} = other -> other
    end
  end

  @doc """
  Same as `get_obstacles/0`, but raises an exception on failure.
  """
  def get_obstacles!, do: when_ok get_obstacles()

  @doc """
  Post telemetry to the server.
  """
  def post_telemetry(%InteropTelem{} = telem) do
    outgoing_telem = Sanitize.sanitize_outgoing_telemetry telem

    case Request.post_telemetry url(), cookie(), outgoing_telem do
      {:ok, message}      -> {:ok, Sanitize.sanitize_message(message)}
      {:error, _} = other -> other
    end
  end

  @doc """
  Same as `post_telemetry/1`, but raises an exception on failure.
  """
  def post_telemetry!(telem), do: when_ok post_telemetry(telem)

  @doc """
  Post a new odlc on the server.

  Note that images can be included with the odlc and will be send in
  an another request.
  """
  def post_odlc(%Odlc{} = odlc) do
    {outgoing_odlc, image} = Sanitize.sanitize_outgoing_odlc odlc

    case Request.post_odlc url(), cookie(), outgoing_odlc do
      {:ok, returned} ->
        returned = Sanitize.sanitize_odlc returned

        if image !== <<>> do
          case Request.post_odlc_image url(), cookie(), returned.id, image do
            {:ok, _}            -> {:ok, returned}
            {:error, _} = other -> other
          end
        else
          {:ok, returned}
        end
      {:error, _} = other ->
        other
    end
  end

  @doc """
  Same as `post_odlc/1`, but raises an exception on failure.
  """
  def post_odlc!(odlc), do: when_ok post_odlc(odlc)

  @doc """
  Get all odlcs on the server.

  By default images are not also returned for each target, to return
  the images, pass in `image: true` with the options.
  """
  def get_odlcs(opts \\ []) do
    case Request.get_odlcs url(), cookie() do
      {:ok, odlcs} ->
        image_resp_list = Enum.map odlcs, fn odlc ->
          case Keyword.get opts, :image, false do
            true  -> Request.get_odlc_image url(), cookie(), odlc["id"]
            false -> {:ok, <<>>}
          end
        end

        first_error = Enum.find image_resp_list, fn
          {:ok, _}    -> false
          {:error, _} -> true
        end

        if first_error === nil do
          message = Enum.zip(odlcs, image_resp_list)
          |> Enum.map(fn {odlc, {:ok, image}} ->
            Sanitize.sanitize_odlc odlc, image
          end)
          |> Sanitize.sanitize_odlc_list

          {:ok, message}
        else
          first_error
        end
      {:error, _} = other ->
        other
    end
  end

  @doc """
  Same as `get_odlcs/1`, but raises an exception on failure.
  """
  def get_odlcs!(opts \\ []), do: when_ok get_odlcs(opts)

  @doc """
  Get an odlc on the server by its id.

  By default images are not also returned for the target, to return
  the image, pass in `image: true` with the options.
  """
  def get_odlc(id, opts \\ []) do
     case Request.get_odlc url(), cookie(), id do
      {:ok, odlc} ->
        image_resp = case Keyword.get opts, :image, false do
          true  -> Request.get_odlc_image url(), cookie(), id
          false -> {:ok, <<>>}
        end

        case image_resp do
          {:ok, image}        -> {:ok, Sanitize.sanitize_odlc(odlc, image)}
          {:error, _} = other -> other
        end
      {:error, _} = other ->
        other
    end
  end

  @doc """
  Same as `get_odlc/2`, but raises an exception on failure.
  """
  def get_odlc!(id, odlc \\ []), do: when_ok get_odlc(id, odlc)

  @doc """
  Update an odlc on the server.

  Unlike the `PUT /api/odlcs` endpoint on the interop server, the
  odlc pass here is completely replaced by the input.

  Note that images can be included with the odlc and will be send in
  an another request, an empty binary value will not replace the
  image on the servers.
  """
  def put_odlc(id, %Odlc{} = odlc) do
    {outgoing_odlc, image} = Sanitize.sanitize_outgoing_odlc odlc

    case Request.put_odlc url(), cookie(), id, outgoing_odlc do
      {:ok, returned} ->
        returned = Sanitize.sanitize_odlc returned

        if image !== <<>> do
          case Request.put_odlc_image url(), cookie(), returned.id, image do
            {:ok, _} -> {:ok, returned}
            other    -> other
          end
        else
          {:ok, returned}
        end
      {:error, _} = other ->
        other
    end
  end

  @doc """
  Same as `put_odlc/2`, but raises an exception on failure.
  """
  def put_odlc!(id, odlc), do: when_ok put_odlc(id, odlc)

  @doc """
  Delete an odlc on the server.
  """
  def delete_odlc(id) do
    case Request.delete_odlc url(), cookie(), id do
      {:ok, message}      -> {:ok, Sanitize.sanitize_message(message)}
      {:error, _} = other -> other
    end
  end

  @doc """
  Same as `delete_odlc/1`, but raises an exception on failure.
  """
  def delete_odlc!(id), do: when_ok delete_odlc(id)

  # For the methods which raise errors.
  defp when_ok({:ok, message}), do: message
end
