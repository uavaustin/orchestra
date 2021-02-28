# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

IMAGERY_IMAGE      := uavaustin/imagery
IMAGERY_TEST_IMAGE := uavaustin/imagery-test

OPTIONS ?= "-it"

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(IMAGERY_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test:
	docker build -t $(IMAGERY_TEST_IMAGE) \
		-f Dockerfile.test $(DOCKERFLAGS) ..
	docker run $(OPTIONS) --rm -v $(current_dir)/coverage:/test/coverage \
		$(IMAGERY_TEST_IMAGE)

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(IMAGERY_IMAGE)
	docker rmi -f $(IMAGERY_TEST_IMAGE)
