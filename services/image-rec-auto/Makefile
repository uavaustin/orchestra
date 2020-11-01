# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

IMAGE_REC_AUTO_IMAGE      := uavaustin/image-rec-auto
IMAGE_REC_AUTO_TEST_IMAGE := uavaustin/image-rec-auto-test

current_dir := $(shell pwd)
UNAME_P := $(shell uname -p)
L4T ?= false

.PHONY: all
all: image

.PHONY: image
image:
ifeq ($(UNAME_P),x86_64)
	docker run --rm --privileged multiarch/qemu-user-static --reset -p yes
endif
	docker build -t $(IMAGE_REC_AUTO_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test:
ifeq ($(L4T), true)
	docker build -t $(IMAGE_REC_AUTO_TEST_IMAGE) -f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --rm --runtime nvidia -v $(current_dir)/coverage:/test/coverage \
		$(IMAGE_REC_AUTO_TEST_IMAGE)
else
	docker build -t $(IMAGE_REC_AUTO_TEST_IMAGE) \
		-f Dockerfile.test_tensorrt $(DOCKERFLAGS) ..
	docker run -it --rm -v $(current_dir)/coverage:/test/coverage \
		$(IMAGE_REC_AUTO_TEST_IMAGE)
endif

.PHONY: clean
clean:
	rm -rf __pycache__ *.pyc messages .tox .pytest_cache .coverage
	docker rmi -f $(IMAGE_REC_AUTO_IMAGE)
	docker rmi -f $(IMAGE_REC_AUTO_TEST_IMAGE)
