# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

IMAGE_REC_WORKER_IMAGE := uavaustin/image-rec-worker

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(IMAGE_REC_WORKER_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: clean
clean:
	rm -rf __pycache__ *.pyc messages
	docker rmi -f $(IMAGE_REC_WORKER_IMAGE)
