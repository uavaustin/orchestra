# See service level Makefiles for more fine-grained control. Note
# that they do not take care of any prerequisites in common/ as that
# is done here.

.PHONY: all
all: common telemetry interop-proxy pong

.PHONY: test
test: interop-proxy-test pong-test

.PHONY: common
common:
	$(MAKE) -C common

.PHONY: telemetry
telemetry: common
	$(MAKE) -C telemetry

.PHONY: interop-proxy
interop-proxy: common
	$(MAKE) -C interop-proxy

.PHONY: interop-proxy-test
interop-proxy-test: common
	$(MAKE) -C interop-proxy test

.PHONY: pong
pong: common
	$(MAKE) -C pong

.PHONY: pong-test
pong-test: common
	$(MAKE) -C pong test

.PHONY: clean
clean:
	$(MAKE) -C common clean
	$(MAKE) -C telemetry clean
	$(MAKE) -C interop-proxy clean
  $(MAKE) -C pong clean
