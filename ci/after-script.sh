#!/bin/sh -ex

# If we're running tests and they output coverage information, then
# submit it to coveralls. Note that since the file directories are
# relative to the root directory of the test container (and should
# start with "/test/..."), we have to replace this with the path of
# the service.

handle_nodejs() {
  NODEJS_LCOV=services/"$SERVICE_TEST"/coverage/lcov.info

  if [ -f "$NODEJS_LCOV" ]; then
    sed "s,SF:/test/,SF:services/$SERVICE_TEST/," "$NODEJS_LCOV" |
      npx coveralls
  fi

handle_python() {
  PYTHON_COV=services/"$SERVICE_TEST"/coverage/.coverage

  if [ -f "$PYTHON_COV" ]; then
    sudo sed -i "s,/test/,services/$SERVICE_TEST/," "$PYTHON_COV"
    cd services/"$SERVICE_TEST"
    pip install coveralls
    coveralls
  fi
}

if [ -n "$SERVICE_TEST" ]; then
  [ -n "$TRAVIS_NODE_VERSION" ] && handle_nodejs
  [ -n "$TRAVIS_PYTHON_VERSION" ] && handle_python
fi
