# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

IMAGE_REC_MASTER_IMAGE := uavaustin/image-rec-master

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: message-src
message-src: src/messages/telemetry.proto src/messages/imagery.proto \
		src/messages/interop.proto

src/messages/%.proto: ../common/messages/%.proto
	mkdir -p src/messages
	cp ../common/messages/$(notdir $@) src/messages/

.PHONY: image
image: message-src
	docker build -t $(IMAGE_REC_MASTER_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(IMAGE_REC_MASTER_IMAGE)
