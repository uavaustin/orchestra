# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

INTEROP_PROXY_IMAGE      := uavaustin/interop-proxy
INTEROP_PROXY_TEST_IMAGE := uavaustin/interop-proxy-test

OPTIONS ?= "-it"

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(INTEROP_PROXY_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test:
	DOCKERFLAGS=$(DOCKERFLAGS) INTEROP_PROXY_IMAGE=$(INTEROP_PROXY_IMAGE) \
		INTEROP_PROXY_TEST_IMAGE=$(INTEROP_PROXY_TEST_IMAGE) ./test.sh $(OPTIONS)

.PHONY: clean
clean:
	docker rmi -f $(INTEROP_PROXY_IMAGE) $(INTEROP_PROXY_TEST_IMAGE)
