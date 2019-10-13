# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

GRAFANA_IMAGE      := uavaustin/grafana

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(GRAFANA_IMAGE) -f Dockerfile $(DOCKERFLAGS) \
		..

.PHONY: clean
clean:
	docker rmi -f $(GRAFANA_IMAGE)
