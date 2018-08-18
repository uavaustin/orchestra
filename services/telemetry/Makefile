# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

TELEMETRY_IMAGE      := uavaustin/telemetry
TELEMETRY_TEST_IMAGE := uavaustin/telemetry-test

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(TELEMETRY_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test:
	DOCKERFLAGS=$(DOCKERFLAGS) TELEMETRY_IMAGE=$(TELEMETRY_IMAGE) \
		TELEMETRY_TEST_IMAGE=$(TELEMETRY_TEST_IMAGE) ./test.sh

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(TELEMETRY_IMAGE)
	docker rmi -f $(TELEMETRY_TEST_IMAGE)
