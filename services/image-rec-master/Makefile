# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

IMAGE_REC_MASTER_IMAGE      := uavaustin/image-rec-master
IMAGE_REC_MASTER_TEST_IMAGE := uavaustin/image-rec-master-test

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(IMAGE_REC_MASTER_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test:
	docker build -t $(IMAGE_REC_MASTER_TEST_IMAGE) \
		-f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --rm -v $(current_dir)/coverage:/test/coverage \
		$(IMAGE_REC_MASTER_TEST_IMAGE)

.PHONY: clean
clean:
	rm -rf __pycache__ *.pyc messages .tox .pytest_cache .coverage
	docker rmi -f $(IMAGE_REC_MASTER_IMAGE)
	docker rmi -f $(IMAGE_REC_MASTER_TEST_IMAGE)