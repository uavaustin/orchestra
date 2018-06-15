# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

PROTOC_IMAGE         := uavaustin/protoc
TELEMETRY_IMAGE      := uavaustin/telemetry
TELEMETRY_TEST_IMAGE := uavaustin/telemetry-test

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: message-src
message-src: src/messages/interop.proto src/messages/telemetry.proto

src/messages/%.proto: ../common/messages/%.proto
	mkdir -p src/messages
	cp ../common/messages/$(notdir $@) src/messages/

.PHONY: image
image: message-src
	docker build -t $(TELEMETRY_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test: message-src
	DOCKERFLAGS=$(DOCKERFLAGS) TELEMETRY_IMAGE=$(TELEMETRY_IMAGE) \
		TELEMETRY_TEST_IMAGE=$(TELEMETRY_TEST_IMAGE) ./test.sh

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(TELEMETRY_IMAGE) $(TELEMETRY_TEST_IMAGE)
