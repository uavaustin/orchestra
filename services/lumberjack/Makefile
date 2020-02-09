# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

LUMBERJACK_IMAGE      := uavaustin/lumberjack
LUMBERJACK_TEST_IMAGE := uavaustin/lumberjack-test
ALPINE_IMAGE    := alpine
INFLUX_IMAGE    := influxdb:alpine

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(LUMBERJACK_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test: alpine
	docker build -t $(LUMBERJACK_TEST_IMAGE) -f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --rm -v $(current_dir)/coverage:/test/coverage \
		-v /var/run/docker.sock:/var/run/docker.sock $(LUMBERJACK_TEST_IMAGE)

.PHONY: alpine
alpine:
	@if ! docker inspect --type=image $(ALPINE_IMAGE) &> /dev/null; then \
		docker pull $(ALPINE_IMAGE); \
	fi
	@if ! docker inspect --type=image $(INFLUX_IMAGE) &> /dev/null; then \
		docker pull $(INFLUX_IMAGE); \
	fi

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(LUMBERJACK_IMAGE)
	docker rmi -f $(LUMBERJACK_TEST_IMAGE)
