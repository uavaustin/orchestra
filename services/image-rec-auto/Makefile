# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

IMAGE_REC_AUTO_IMAGE      := uavaustin/image-rec-auto
IMAGE_REC_AUTO_TEST_IMAGE := uavaustin/image-rec-auto-test

current_dir := $(shell pwd)
UNAME_P := $(shell uname -p)

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
	docker build -t $(IMAGE_REC_AUTO_TEST_IMAGE) -f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --runtime --rm nvidia -v $(current_dir)/coverage:/test/coverage \
		$(IMAGE_REC_AUTO_TEST_IMAGE)

.PHONY: clean
clean:
	rm -rf __pycache__ *.pyc messages .tox .pytest_cache .coverage
	docker rmi -f $(IMAGE_REC_AUTO_IMAGE)
	docker rmi -f $(IMAGE_REC_AUTO_TEST_IMAGE)
