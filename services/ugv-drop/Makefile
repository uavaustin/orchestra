.DEFAULT_GOAL := all

# Flags for docker when building images, meant to be overridden.
DOCKERFLAGS :=

IMAGE_UGV_DROP_IMAGE      := uavaustin/ugv-drop
IMAGE_UGV_DROP_TEST_IMAGE := uavaustin/ugv-drop

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(IMAGE_UGV_DROP_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test:
	docker build -t $(IMAGE_UGV_DROP_TEST_IMAGE) \
		-f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --rm -v $(current_dir)/coverage:/test/coverage \
		-v /var/run/docker.sock:/var/run/docker.sock \
		$(IMAGE_UGV_DROP_TEST_IMAGE)

.PHONY: clean
clean:
	rm -rf __pycache__ *.pyc messages .tox .pytest_cache .coverage
	docker rmi -f $(IMAGE_UGV_DROP_TEST_IMAGE)
	docker rmi -f $(IMAGE_UGV_DROP_IMAGE)
