# Mavproxy

Service that wraps [mavproxy](https://github.com/ArduPilot/MAVProxy) which is a
command-line ground station that also allows for multiple ground stations to be
connected to the same plane.

Note that the utilities requiring image recognition and GUIs are not usable
within this container as the dependenices needed are not installed.

To play a tune when starting up (so it is easy to identify when a connection to
the plane is made), set the `STARTING_TUNE` environment variable to a valid
[QBasic PLAY string](https://en.m.wikibooks.org/wiki/QBasic/Appendix#PLAY) e.g.
`docker run -e STARTING_TUNE="abc" uavaustin/mavproxy`.

When running the service with `docker run`, arguments passed in after the image
name are passed into mavproxy.
