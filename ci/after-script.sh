#!/bin/sh -ex

# If we're running tests and they output coverage information, then
# submit it to coveralls. Note that since the file directories are
# relative to the root directory of the test container (and should
# start with "/test/..."), we have to replace this with the path of
# the service.
if [ -n "$SERVICE_TEST" ]; then
  NODEJS_LCOV=services/"$SERVICE_TEST"/coverage/lcov.info
  PY_COV=services/"$SERVICE_TEST"/coverage/.coverage

  if [ -f "$NODEJS_LCOV" ]; then
    sed "s,SF:/test/,SF:services/$SERVICE_TEST/," "$NODEJS_LCOV" |
      npx coveralls
  fi

  if [ -f "$PY_COV" ]; then
    sed -i "s,/test/,services/$SERVICE_TEST/," "$PY_COV"
    cd services/$SERVICE_TEST
    pip install coveralls
    coveralls
  fi
fi
