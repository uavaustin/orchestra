# Builds and runs the testing container and takes care of bringing a
# test interop server online as well for the duration of the test.

docker network create --subnet=172.37.0.0/16 interop-proxy-test > /dev/null

interop_id=$(docker run -itd --rm --net=interop-proxy-test --ip=172.37.0.2 \
        auvsisuas/interop-server)

docker build -t $INTEROP_PROXY_TEST_IMAGE -f Dockerfile.test $DOCKERFLAGS ..

printf "\n\033[34mStarting tests...\033[0m\n\n"

docker run -it --rm --net=interop-proxy-test -e INTEROP_URL=172.37.0.2 \
        $INTEROP_PROXY_TEST_IMAGE

result=$?

docker kill $interop_id > /dev/null
docker network rm interop-proxy-test > /dev/null

exit $result
