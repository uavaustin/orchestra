# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

PONG_IMAGE      := uavaustin/tanstar
PONG_TEST_IMAGE := uavaustin/tanstar-test
ALPINE_IMAGE    := alpine

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(PONG_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

# TODO: add some unit tests to tanstar, make target won't work here
.PHONY: test
test: alpine
	docker build -t $(PONG_TEST_IMAGE) -f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --rm -v $(current_dir)/coverage:/test/coverage \
		-v /var/run/docker.sock:/var/run/docker.sock $(PONG_TEST_IMAGE)

.PHONY: alpine
alpine:
	@if ! docker inspect --type=image $(ALPINE_IMAGE) &> /dev/null; then \
		docker pull $(ALPINE_IMAGE); \
	fi

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(PONG_IMAGE)
	docker rmi -f $(PONG_TEST_IMAGE)
