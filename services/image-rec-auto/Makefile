# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=
JETSON ?= "true"

IMAGE_REC_AUTO_IMAGE      := uavaustin/image-rec-auto
IMAGE_REC_AUTO_TEST_IMAGE := uavaustin/image-rec-auto-test

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(IMAGE_REC_AUTO_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test:
ifeq "$(JETSON)" "true"
	docker build -t $(IMAGE_REC_AUTO_TEST_IMAGE) -f Dockerfile.test \
		--build-arg BASE=nvcr.io/nvidia/l4t-pytorch:r32.4.4-pth1.6-py3  $(DOCKERFLAGS) ..
	docker run -it --ipc=host --rm --runtime nvidia -v $(current_dir)/coverage:/test/coverage \
		$(IMAGE_REC_AUTO_TEST_IMAGE)
else
	docker build -t $(IMAGE_REC_AUTO_TEST_IMAGE) -f Dockerfile.test \
		--build-arg BASE=nvcr.io/nvidia/pytorch:20.10-py3  $(DOCKERFLAGS) ..
	docker run -it --ipc=host --rm  -v $(current_dir)/coverage:/test/coverage \
		$(IMAGE_REC_AUTO_TEST_IMAGE)
endif

.PHONY: clean
clean:
	rm -rf __pycache__ *.pyc messages .tox .pytest_cache .coverage
	docker rmi -f $(IMAGE_REC_AUTO_IMAGE)
	docker rmi -f $(IMAGE_REC_AUTO_TEST_IMAGE)
