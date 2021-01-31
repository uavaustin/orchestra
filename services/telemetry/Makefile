# Flags for docker when building images, meant to be overridden
DOCKERFLAGS :=

TELEMETRY_IMAGE      := uavaustin/telemetry
TELEMETRY_TEST_IMAGE := uavaustin/telemetry-test
PLANE_SITL_IMAGE     := uavaustin/plane-sitl

current_dir := $(shell pwd)

.PHONY: all
all: image

.PHONY: image
image:
	docker build -t $(TELEMETRY_IMAGE) -f Dockerfile $(DOCKERFLAGS) ..

.PHONY: test
test: plane-sitl
	docker build -t $(TELEMETRY_TEST_IMAGE) \
		-f Dockerfile.test $(DOCKERFLAGS) ..
	docker run -it --rm -v $(current_dir)/coverage:/test/coverage \
		-v /var/run/docker.sock:/var/run/docker.sock $(TELEMETRY_TEST_IMAGE)

.PHONY: plane-sitl
plane-sitl:
	@if ! docker inspect --type=image $(PLANE_SITL_IMAGE) &> /dev/null; then \
		docker pull $(PLANE_SITL_IMAGE); \
	fi

.PHONY: clean
clean:
	rm -rf node_modules lib package-lock.json
	docker rmi -f $(TELEMETRY_IMAGE)
	docker rmi -f $(TELEMETRY_TEST_IMAGE)
