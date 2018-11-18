# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

PONG_IMAGE      := uavaustin/pong
PONG_TEST_IMAGE := uavaustin/pong-test

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(PONG_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test:
	docker build -t $(PONG_TEST_IMAGE) -f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --rm -v $(current_dir)/coverage:/test/coverage \
		$(PONG_TEST_IMAGE)

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(PONG_IMAGE)
	docker rmi -f $(PONG_TEST_IMAGE)
