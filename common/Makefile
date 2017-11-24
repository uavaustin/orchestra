# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

PROTOC_IMAGE := uavaustin/protoc

.PHONY: all
all: protoc

.PHONY: protoc
protoc:
	docker build -t $(PROTOC_IMAGE) -f containers/Dockerfile.protoc \
		$(DOCKERFLAGS) ..

.PHONY: clean
clean:
	docker rmi -f $(PROTOC_IMAGE)
