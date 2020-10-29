#!/bin/sh -ex

# Build a service if the env var is set.
if [ -n "$SERVICE" ]; then
  make "$SERVICE"
fi

# Run tests if specified.
if [ -n "$SERVICE_TEST" ]; then
  # Change options for tty
  OPTIONS="-i"
  make "$SERVICE_TEST"-test
fi
