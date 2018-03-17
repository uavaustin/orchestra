# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

PROTOC_IMAGE           := uavaustin/protoc
IMAGE_REC_WORKER_IMAGE := uavaustin/image-rec-worker

current_dir := $(shell pwd)

.PHONY: all
all: proto image

.PHONY: proto
proto: messages/telemetry_pb2.py messages/imagery_pb2.py

messages/%_pb2.py: ../common/messages/%.proto
	docker run -it \
		-v $(current_dir)/../common/messages:/messages \
		-v $(current_dir)/messages:/dist \
		$(PROTOC_IMAGE) \
		protoc -I=/messages --python_out=/dist /messages/$(notdir $<)

.PHONY: image
image:
	docker build -t $(IMAGE_REC_WORKER_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: clean
clean:
	rm -rf __pycache__ *.pyc messages
	docker rmi -f $(IMAGE_REC_WORKER_IMAGE)
