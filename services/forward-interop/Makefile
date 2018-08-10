# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

FORWARD_INTEROP_IMAGE      := uavaustin/forward-interop
FORWARD_INTEROP_TEST_IMAGE := uavaustin/forward-interop-test

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(FORWARD_INTEROP_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test:
	docker build -t $(FORWARD_INTEROP_TEST_IMAGE) \
		-f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --rm -v $(current_dir)/coverage:/test/coverage \
		$(FORWARD_INTEROP_TEST_IMAGE)

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(FORWARD_INTEROP_IMAGE)
	docker rmi -f $(FORWARD_INTEROP_TEST_IMAGE)
