# See service level Makefiles for more fine-grained control. Note
# that they do not take care of any prerequisites in common/ as that
# is done here.

.PHONY: all
all: common telemetry pong

.PHONY: test
test: pong-test

.PHONY: common
common:
	$(MAKE) -C common

.PHONY: telemetry
telemetry: common
	$(MAKE) -C telemetry

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
	$(MAKE) -C pong clean
