#!/bin/sh -ex

# Build a service if the env var is set.
if [ -n "$SERVICE" ]; then
  make "$SERVICE"
fi

# Run tests if specified.
if [ -n "$SERVICE_TEST" ]; then
  make "$SERVICE_TEST"-test
fi
