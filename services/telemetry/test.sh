#!/bin/sh

# Builds and runs the testing container and takes care of bringing a
# plane-sitl container up for the duration of the test. All output is
# directed to stderr except for the actuall test.

handle_result() {
    if [ "$1" -ne 0 ]; then
        printf "\033[31m error\033[0m\n" 1>&2
        exit 1
    else
        printf "\033[32m done\033[0m\n" 1>&2
    fi
}

printf "Creating test network..." 1>&2

docker network create --subnet=172.37.1.0/16 telemetry-test-net \
        > /dev/null 2>&1

handle_result "$?"

printf "Starting plane-sitl..." 1>&2

docker run -itd --rm --net=telemetry-test-net --ip=172.37.1.2 \
        --name plane-sitl-test uavaustin/plane-sitl > /dev/null 2>&1

handle_result "$?"

printf "\033[33mBuilding image...\033[0m\n" 1>&2

docker build -t $TELEMETRY_TEST_IMAGE -f Dockerfile.test $DOCKERFLAGS .. 1>&2

if [ "$?" -eq 0 ]; then
    printf "\n\033[34mStarting tests...\033[0m\n\n" 1>&2

    docker run -it --rm --net=telemetry-test-net \
            -e CXN_STR=udpout:172.37.1.2:14550 $TELEMETRY_TEST_IMAGE

    result=$?
else
    result=1
fi

printf "Taking down plane-sitl..." 1>&2

docker kill plane-sitl-test > /dev/null 2>&1

handle_result "$?"

printf "Taking down test network..." 1>&2

docker network rm telemetry-test-net > /dev/null 2>&1

handle_result "$?"

exit $result
