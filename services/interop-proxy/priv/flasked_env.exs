%{
  interop_proxy: %{
    url: {:flasked, :INTEROP_URL, :string, "0.0.0.0:8080"},
    username: {:flasked, :INTEROP_USERNAME, :string, "testuser"},
    password: {:flasked, :INTEROP_PASSWORD, :string, "testpass"},
    mission_id: {:flasked, :MISSION_ID, :integer, 1}
  }
}
