# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

PROTOC_IMAGE    := uavaustin/protoc
TELEMETRY_IMAGE := uavaustin/telemetry

current_dir := $(shell pwd)

.PHONY: all
all: proto image

.PHONY: proto
proto: lib/messages/interop_pb.js lib/messages/telemetry_pb.js

lib/messages/%_pb.js: ../common/messages/%.proto
	docker run -it \
		-v $(current_dir)/../common/messages:/messages \
		-v $(current_dir)/lib/messages:/dist \
		$(PROTOC_IMAGE) \
		protoc -I=/messages \
			--js_out=import_style=commonjs,binary:/dist /messages/$(notdir $<)

.PHONY: image
image:
	docker build -t $(TELEMETRY_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(TELEMETRY_IMAGE)
