# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=
JETSON ?= "false"
HAWK_EYE_VERSION := 0.0.2b0

IMAGE_REC_AUTO_IMAGE            := uavaustin/image-rec-auto
IMAGE_REC_AUTO_IMAGE_L4T        := uavaustin/image-rec-auto-l4t
IMAGE_REC_AUTO_TEST_IMAGE       := uavaustin/image-rec-auto-test
IMAGE_REC_AUTO_TEST_IMAGE_L4T   := uavaustin/image-rec-auto-test-l4t

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
ifeq "$(JETSON)" "true"
	docker build -t $(IMAGE_REC_AUTO_IMAGE_L4T) -f Dockerfile \
		--build-arg BASE=nvcr.io/nvidia/l4t-pytorch:r32.4.4-pth1.6-py3 \
		--build-arg HAWK_EYE_VERSION=$(HAWK_EYE_VERSION) \
		$(DOCKERFLAGS) .. 
else
	docker build -t $(IMAGE_REC_AUTO_IMAGE) -f Dockerfile \
		--build-arg BASE=pytorch/pytorch:1.7.0-cuda11.0-cudnn8-runtime  \
		--build-arg install_pytorch=TRUE \
		--build-arg HAWK_EYE_VERSION=$(HAWK_EYE_VERSION) \
		$(DOCKERFLAGS) ..
endif

.PHONY: test
test:
ifeq "$(JETSON)" "true"
	docker build -t $(IMAGE_REC_AUTO_TEST_IMAGE_L4T) -f Dockerfile.test \
		--build-arg BASE=nvcr.io/nvidia/l4t-pytorch:r32.4.4-pth1.6-py3 \
		--build-arg HAWK_EYE_VERSION=$(HAWK_EYE_VERSION)
		 $(DOCKERFLAGS) ..

	docker run -it --ipc=host --rm --runtime nvidia -v $(current_dir)/coverage:/test/coverage \
		$(IMAGE_REC_AUTO_TEST_IMAGE)
else
	docker build -t $(IMAGE_REC_AUTO_TEST_IMAGE) -f Dockerfile.test \
		--build-arg BASE=pytorch/pytorch:1.7.0-cuda11.0-cudnn8-runtime  \
		--build-arg install_pytorch=TRUE \
		--build-arg HAWK_EYE_VERSION=$(HAWK_EYE_VERSION) \
		$(DOCKERFLAGS) ..
	
	docker run -it --ipc=host --rm -v $(current_dir)/coverage:/test/coverage \
		$(IMAGE_REC_AUTO_TEST_IMAGE)
endif

.PHONY: clean
clean:
	rm -rf __pycache__ *.pyc messages .tox .pytest_cache .coverage
	docker rmi -f $(IMAGE_REC_AUTO_IMAGE)
	docker rmi -f $(IMAGE_REC_AUTO_IMAGE_L4T)
	docker rmi -f $(IMAGE_REC_AUTO_TEST_IMAGE)
	docker rmi -f $(IMAGE_REC_AUTO_TEST_IMAGE_L4T)
