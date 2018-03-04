# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

PATHFINDING_IMAGE      := uavaustin/pathfinding

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(PATHFINDING_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: clean
clean:
	docker rmi -f $(PATHFINDING_IMAGE)
