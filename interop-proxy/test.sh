#!/bin/sh

# Builds and runs the testing container and takes care of bringing a
# test interop server online as well for the duration of the test.

docker network create --subnet=172.37.0.0/16 interop-proxy-test > /dev/null

# Start the server and retry if it doesn't come alive
start_interop_server() {
    printf "\033[33mStarting interop server..." 1>&2

    id=$(docker run -itd --rm --net=interop-proxy-test --ip=172.37.0.2 \
            -p 8081:80 auvsisuas/interop-server)

    sleep 10

    i=0

    send() {
        curl --output /dev/null --silent --head 0.0.0.0:8081 --max-time 1
    }

    until [ "$i" -eq 20 ] || $(send); do
        printf "." 1>&2

        sleep 1
        i=$((i + 1))
    done

    if [ "$i" = "20" ]; then
        printf "\033[0m\nTrying again...\n" 1>&2

        docker kill "$id" > /dev/null

        sleep 3

        start_interop_server
    else
        printf "\033[0m\n" 1>&2

        echo $id
    fi
}

interop_id=$(start_interop_server)

docker build -t $INTEROP_PROXY_TEST_IMAGE -f Dockerfile.test $DOCKERFLAGS ..

printf "\n\033[34mStarting tests...\033[0m\n\n"

docker run -it --rm --net=interop-proxy-test -e INTEROP_URL=172.37.0.2 \
        $INTEROP_PROXY_TEST_IMAGE

result=$?

docker kill $interop_id > /dev/null
docker network rm interop-proxy-test > /dev/null

exit $result
