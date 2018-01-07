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
  def get_active_mission! do
    {:ok, missions} = Request.get_missions url(), cookie()

    missions
    |> Enum.find(fn mission -> mission["active"] === true end)
    |> Sanitize.sanitize_mission
  end

  @doc """
  Return the stationary and moving obstacles on the server.
  """
  def get_obstacles! do
    {:ok, obstacles} = Request.get_obstacles url(), cookie()

    Sanitize.sanitize_obstacles obstacles
  end

  @doc """
  Post telemetry to the server.
  """
  def post_telemetry!(%InteropTelem{} = telem) do
    outgoing_telem = Sanitize.sanitize_outgoing_telemetry telem

    {:ok, message} = Request.post_telemetry url(), cookie(), outgoing_telem

    Sanitize.sanitize_message message
  end

  @doc """
  Post a new odlc on the server.

  Note that images can be included with the odlc and will be send in
  an another request.
  """
  def post_odlc!(%Odlc{} = odlc) do
    {outgoing_odlc, image} = Sanitize.sanitize_outgoing_odlc odlc

    {:ok, returned} = Request.post_odlc url(), cookie(), outgoing_odlc

    returned = Sanitize.sanitize_odlc returned

    if image !== <<>> do
      {:ok, _} = Request.post_odlc_image url(), cookie(), returned.id, image
      returned
    else
      returned
    end
  end

  @doc """
  Get all odlcs on the server.

  By default images are not also returned for each target, to return
  the images, pass in `image: true` with the options.
  """
  def get_odlcs!(opts \\ []) do
    {:ok, odlcs} = Request.get_odlcs url(), cookie()

    odlcs
    |> Enum.map(fn odlc ->
      image = case Keyword.get opts, :image, false do
        true ->
          {:ok, image} = Request.get_odlc_image url(), cookie(), odlc["id"]
          image
        false ->
          <<>>
      end

      Sanitize.sanitize_odlc odlc, image
    end)
    |> Sanitize.sanitize_odlc_list
  end

  @doc """
  Get an odlc on the server by its id.

  By default images are not also returned for the target, to return
  the image, pass in `image: true` with the options.
  """
  def get_odlc!(id, opts \\ []) do
    {:ok, odlc} = Request.get_odlc url(), cookie(), id

    image = case Keyword.get opts, :image, false do
      true ->
        {:ok, image} = Request.get_odlc_image url(), cookie(), id
        image
      false ->
        <<>>
    end

    Sanitize.sanitize_odlc odlc, image
  end

  @doc """
  Update an odlc on the server.

  Unlike the `PUT /api/odlcs` endpoint on the interop server, the
  odlc pass here is completely replaced by the input.

  Note that images can be included with the odlc and will be send in
  an another request, an empty binary value will not replace the
  image on the servers.
  """
  def put_odlc!(id, %Odlc{} = odlc) do
    {outgoing_odlc, image} = Sanitize.sanitize_outgoing_odlc odlc

    {:ok, returned} = Request.put_odlc url(), cookie(), id, outgoing_odlc

    returned = Sanitize.sanitize_odlc returned

    if image !== <<>> do
      {:ok, _} = Request.put_odlc_image url(), cookie(), returned.id, image
      returned
    else
      returned
    end
  end

  @doc """
  Delete an odlc on the server.
  """
  def delete_odlc!(id) do
    {:ok, message} = Request.delete_odlc url(), cookie(), id

    Sanitize.sanitize_message message
  end
end
