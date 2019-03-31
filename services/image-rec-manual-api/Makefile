# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

IMAGE_REC_MANUAL_API_IMAGE      := uavaustin/image-rec-manual-api
IMAGE_REC_MANUAL_API_TEST_IMAGE := uavaustin/image-rec-manual-api-test

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(IMAGE_REC_MANUAL_API_IMAGE) \
		-f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test:
	docker build -t $(IMAGE_REC_MANUAL_API_TEST_IMAGE) \
		-f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --rm -v $(current_dir)/coverage:/test/coverage \
		$(IMAGE_REC_MANUAL_API_TEST_IMAGE)

.PHONY: clean
clean:
	rm -rf **/__pycache__ **/*.pyc messages .pytest_cache coverage
	docker rmi -f $(IMAGE_REC_MANUAL_API_IMAGE)
	docker rmi -f $(IMAGE_REC_MANUAL_API_TEST_IMAGE)
