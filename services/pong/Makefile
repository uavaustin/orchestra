# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

PROTOC_IMAGE    := uavaustin/protoc
PONG_IMAGE      := uavaustin/pong
PONG_TEST_IMAGE := uavaustin/pong-test

current_dir := $(shell pwd)

.PHONY: all
all: proto image

.PHONY: proto
proto: lib/messages/stats_pb.js

lib/messages/stats_pb.js: ../common/messages/stats.proto
	docker run -it \
		-v $(current_dir)/../common/messages:/messages \
		-v $(current_dir)/lib/messages:/dist \
		$(PROTOC_IMAGE) \
		protoc -I=/messages \
			--js_out=import_style=commonjs,binary:/dist \
			/messages/stats.proto

.PHONY: image
image:
	docker build -t $(PONG_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test: proto
	docker build -t $(PONG_TEST_IMAGE) -f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it $(PONG_TEST_IMAGE)

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(PONG_IMAGE) $(PONG_TEST_IMAGE)
