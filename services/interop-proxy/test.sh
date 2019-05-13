#!/bin/sh

# Builds and runs the testing container and takes care of bringing a
# test interop server online as well for the duration of the test.

docker network create --subnet=172.37.0.0/16 interop-proxy-test-net > /dev/null

if [ "$?" -ne 0 ]; then
    printf "\033[31mCould not create test network\033[0m\n" 1>&2
    exit 1
fi

# Start the server and retry if it doesn't come alive
start_interop_server() {
    printf "\033[33mStarting interop server..." 1>&2

    docker run -itd --rm --net=interop-proxy-test-net --ip=172.37.0.2 \
            -p 8081:80 --name interop-proxy-test \
            uavaustin/interop-server:2018.12 \
            > /dev/null

    if [ "$?" -ne 0 ]; then
        printf "\033[31mCould not create interop server\033[0m\n" 1>&2
        return 1
    fi

    sleep 1

    i=0

    send() {
        curl --output /dev/null --silent --head 0.0.0.0:8081 --max-time 1
    }

    until [ "$i" -eq 30 ] || $(send); do
        printf "." 1>&2

        sleep 1
        i=$((i + 1))
    done

    if [ "$i" = "30" ]; then
        printf "\033[0m\nTrying again...\n" 1>&2

        docker kill interop-proxy-test > /dev/null

        sleep 1

        start_interop_server
    else
        printf "\033[0m\n" 1>&2
    fi
}

start_interop_server

if [ "$?" -eq 0 ]; then
    docker build -t $INTEROP_PROXY_TEST_IMAGE \
            -f Dockerfile.test $DOCKERFLAGS \
            ..

    built=$?
else
    built=1
fi

if [ "$built" -eq 0 ]; then
    printf "\n\033[34mStarting tests...\033[0m\n\n"

    docker run -it --rm --net=interop-proxy-test-net \
            -e INTEROP_URL=172.37.0.2 $INTEROP_PROXY_TEST_IMAGE

    result=$?
else
    result=1
fi

docker kill interop-proxy-test > /dev/null
docker network rm interop-proxy-test-net > /dev/null

exit $result
