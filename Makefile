# See service level Makefiles for more fine-grained control. Note
# that they do not take care of any prerequisites in common/ as that
# is done here.

.PHONY: all
all: common telemetry

.PHONY: common
common:
	$(MAKE) -C common

.PHONY: telemetry
telemetry: common
	$(MAKE) -C telemetry

.PHONY: clean
clean:
	$(MAKE) -C common clean
	$(MAKE) -C telemetry clean
