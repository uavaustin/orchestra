#!/bin/sh -ex

echo $SERVICE_TEST
# Build a service if the env var is set.
if [ -n "$SERVICE" ]; then
  make "$SERVICE"
fi

# Run tests if specified.
if [ -n "$SERVICE_TEST" ]; then
  # Change options for tty
  make "$SERVICE_TEST"-test
fi
