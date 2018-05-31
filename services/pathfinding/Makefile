# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

PROTOC_IMAGE      := uavaustin/protoc
PATHFINDING_IMAGE := uavaustin/pathfinding

current_dir := $(shell pwd)

.PHONY: all
all: proto image

.PHONY: proto
proto: src/messages/interop.rs src/messages/telemetry.rs src/messages/pathfinding.rs

src/messages/%.rs: ../common/messages/%.proto
	docker run -it \
		-v $(current_dir)/../common/messages:/messages \
		-v $(current_dir)/src/messages:/dist \
		$(PROTOC_IMAGE) \
		protoc -I=/messages --rust_out /dist /messages/$(notdir $<)

.PHONY: image
image:
	docker build -t $(PATHFINDING_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: clean
clean:
	rm -rf Cargo.lock target src/messages
	docker rmi -f $(PATHFINDING_IMAGE)
