# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

DASHBOARD_IMAGE := uavaustin/dashboard

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(DASHBOARD_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(DASHBOARD_IMAGE)
