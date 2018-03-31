# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

MAVPROXY_IMAGE := uavaustin/mavproxy

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(MAVPROXY_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: clean
clean:
	docker rmi -f $(MAVPROXY_IMAGE)
