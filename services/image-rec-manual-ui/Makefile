# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

IMAGE_REC_MANUAL_UI_IMAGE      := uavaustin/image-rec-manual-ui
IMAGE_REC_MANUAL_UI_TEST_IMAGE := uavaustin/image-rec-manual-ui-test

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(IMAGE_REC_MANUAL_UI_IMAGE) -f Dockerfile $(DOCKERFLAGS) \
		..

.PHONY: test
test:
	docker build -t $(IMAGE_REC_MANUAL_UI_TEST_IMAGE) \
		-f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --rm -v $(current_dir)/coverage:/test/coverage \
		-v /var/run/docker.sock:/var/run/docker.sock \
		$(IMAGE_REC_MANUAL_UI_TEST_IMAGE)

.PHONY: clean
clean:
	rm -rf assets/node_modules assets/dist assets/package-lock.json \
		assets/.cache
	docker rmi -f $(IMAGE_REC_MANUAL_UI_IMAGE)
	docker rmi -f $(IMAGE_REC_MANUAL_UI_TEST_IMAGE)
