# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

FORWARD_INTEROP_IMAGE := uavaustin/forward-interop

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(FORWARD_INTEROP_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(FORWARD_INTEROP_IMAGE)
