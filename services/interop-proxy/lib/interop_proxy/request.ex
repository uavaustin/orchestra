defmodule InteropProxy.Request do
  @moduledoc """
  Handles making requests to the AUVSI SUAS Interoperability Server.

  After logging in, the cookie must be passed to the server after
  subsequent requests.
  """

  @json       {"Content-Type", "application/json"}
  @jpeg       {"Content-Type", "image/jpeg"}
  @urlencoded {"Content-Type", "application/x-www-form-urlencoded"}

  @doc """
  Log in to the server and get a cookie.
  """
  def login(url, username, password) do
    body = get_json %{username: username, password: password}

    "http://#{url}/api/login"
    |> HTTPoison.post(body, [@urlencoded])
    |> handle_resp(:login)
  end

  @doc """
  Get a specific mission from the server.
  """
  def get_mission(url, cookie, id) when is_integer(id) do
    "http://#{url}/api/missions/#{id}"
    |> cookie_get(cookie)
    |> handle_resp(:json)
  end

  @doc """
  Post UAS telemetry to the server.
  """
  def post_telemetry(url, cookie, telem) when is_map(telem) do
    body = get_json(telem)

    "http://#{url}/api/telemetry"
    |> cookie_post(cookie, body)
    |> handle_resp(:text, text: "UAS Telemetry Successfully Posted.")
  end

  @doc """
  Post a new ODLC to the server.
  """
  def post_odlc(url, cookie, odlc, mission_id) when is_map(odlc) do
    body = get_json(odlc |> Map.put(:mission, mission_id))

    "http://#{url}/api/odlcs"
    |> cookie_post(cookie, body)
    |> handle_resp(:json)
  end

  @doc """
  Get all ODLCs from the server.
  """
  def get_odlcs(url, cookie, mission_id) do
    "http://#{url}/api/odlcs?mission=#{mission_id}"
    |> cookie_get(cookie)
    |> handle_resp(:json)
  end

  @doc """
  Get a ODLC from the server.
  """
  def get_odlc(url, cookie, id) when is_integer(id) do
    "http://#{url}/api/odlcs/#{id}"
    |> cookie_get(cookie)
    |> handle_resp(:json)
  end

  @doc """
  Update an ODLC on the server.
  """
  def put_odlc(url, cookie, id, odlc, mission_id)
  when is_integer(id) and is_map(odlc) do
    body = get_json(odlc |> Map.put(:mission, mission_id))

    "http://#{url}/api/odlcs/#{id}"
    |> cookie_put(cookie, body)
    |> handle_resp(:json)
  end

  @doc """
  Delete an ODLC from the server.
  """
  def delete_odlc(url, cookie, id) when is_integer(id) do
    "http://#{url}/api/odlcs/#{id}"
    |> cookie_delete(cookie)
    |> handle_resp(:text, text: "Odlc deleted.")
  end

  @doc """
  Get an ODLC's image from the server.
  """
  def get_odlc_image(url, cookie, id) when is_integer(id) do
    "http://#{url}/api/odlcs/#{id}/image"
    |> cookie_get(cookie)
    |> handle_resp(:get_image)
  end

  @doc """
  Post an ODLC's image from the server.
  """
  def post_odlc_image(url, cookie, id, image)
  when is_integer(id) and is_binary(image) do
    "http://#{url}/api/odlcs/#{id}/image"
    |> cookie_post(cookie, image, [@jpeg])
    |> handle_resp(:text, text: "Image uploaded.")
  end

  @doc """
  Update an ODLC's image from the server.

  This works the same as posting a new image.
  """
  def put_odlc_image(url, cookie, id, image),
    do: post_odlc_image(url, cookie, id, image)

  @doc """
  Delete an ODLC's image from the server.
  """
  def delete_odlc_image(url, cookie, id) when is_integer(id) do
    "http://#{url}/api/odlcs/#{id}/image"
    |> cookie_delete(cookie)
    |> handle_resp(:text, text: "Image deleted.")
  end

  # Function head for generic responses, by default, no options are
  # passed to the handler's below. HTTPoison errors are matched last.
  defp handle_resp(value, type, opts \\ [])

  # Making sure we have a succesful login, and getting the cookie
  # from the response.
  defp handle_resp({:ok, %{status_code: 200} = resp}, :login, _opts) do
    headers = Enum.into resp.headers, %{}

    cookie = headers["Set-Cookie"]
    |> String.split(";")
    |> List.first

    {:ok, resp.body, cookie}
  end

  # Making sure we're getting a jpeg back.
  defp handle_resp({:ok, %{status_code: 200, body: body} = resp},
      :get_image, _opts) when is_binary(body) do
    headers = Enum.into resp.headers, %{}

    # We'll have a match error if it's not a jpeg.
    @jpeg = {"Content-Type", headers["Content-Type"]}

    {:ok, body}
  end

  # If the odlc exists, but not the image, just return an empty
  # binary.
  defp handle_resp({:ok, %{status_code: 404} = resp}, :get_image, _opts) do
    true = String.match?(resp.body, ~r/Odlc [0-9]+ has no image/)
    {:ok, <<>>}
  end

  # Handling generic JSON responses.
  defp handle_resp({:ok, %{status_code: code} = resp}, :json, _opts)
  when code in [200, 201] do
    {:ok, Poison.Parser.parse!(resp.body)}
  end

  # Handling and verifying a generic text response.
  defp handle_resp({:ok, %{status_code: code, body: body}}, :text, opts)
  when code in [200, 201] do
    ^body = Keyword.fetch! opts, :text
    {:ok, body}
  end

  # If HTTPoison returns an error, we'll handle this case gracefully.
  defp handle_resp({:error, _reason} = value, _type, _opts), do: value

  # If our cookie is not working, we'll handle it seperately.
  defp handle_resp({:ok, %{status_code: 403}}, _type, _opts),
    do: {:error, :forbidden}

  # If we have anything else, we'll return the status code and body
  # as the reason for an error.
  defp handle_resp({:ok, resp}, _type, _opts),
    do: {:error, {:message, resp.status_code, resp.body}}

  # Making a json encoded message from a map.
  defp get_json(body) when is_map(body),
    do: Poison.encode!(body)

  # Send a POST request with a cookie (default is json body).
  defp cookie_post(url, cookie, body, headers \\ [@json]),
    do: HTTPoison.post(url, body, headers ++ [{"Cookie", cookie}])

  # Send a GET request with a cookie.
  defp cookie_get(url, cookie, headers \\ []),
    do: HTTPoison.get(url, headers ++ [{"Cookie", cookie}])

  # Send a PUT request with a cookie (default is json body).
  defp cookie_put(url, cookie, body, headers \\ [@json]),
    do: HTTPoison.put(url, body, headers ++ [{"Cookie", cookie}])

  # Send a DELETE request with a cookie.
  defp cookie_delete(url, cookie, headers \\ []),
    do: HTTPoison.delete(url, headers ++ [{"Cookie", cookie}])
end
