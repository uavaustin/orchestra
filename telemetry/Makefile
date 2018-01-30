# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

PROTOC_IMAGE    := uavaustin/protoc
TELEMETRY_IMAGE := uavaustin/telemetry

current_dir := $(shell pwd)

.PHONY: all
all: proto image

.PHONY: proto
proto: messages/interop_pb2.py messages/telemetry_pb2.py

messages/%_pb2.py: ../common/messages/%.proto
	docker run -it \
		-v $(current_dir)/../common/messages:/messages \
		-v $(current_dir)/messages:/dist \
		$(PROTOC_IMAGE) \
		protoc -I=/messages --python_out=/dist /messages/$(notdir $<)

.PHONY: image
image:
	docker build -t $(TELEMETRY_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: clean
clean:
	rm -rf __pycache__ *.pyc messages
	docker rmi -f $(TELEMETRY_IMAGE)
