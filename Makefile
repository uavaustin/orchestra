# See service level Makefiles for more fine-grained control.

.PHONY: all
all: mavproxy telemetry interop-proxy pong forward-interop imagery dashboard \
	image-rec-master

.PHONY: test
test: telemetry-test interop-proxy-test pong-test forward-interop-test \
	imagery-test image-rec-master-test

.PHONY: mavproxy
mavproxy:
	$(MAKE) -C services/mavproxy

.PHONY: telemetry
telemetry:
	$(MAKE) -C services/telemetry

.PHONY: telemetry-test
telemetry-test:
	$(MAKE) -C services/telemetry test

.PHONY: interop-proxy
interop-proxy:
	$(MAKE) -C services/interop-proxy

.PHONY: interop-proxy-test
interop-proxy-test:
	$(MAKE) -C services/interop-proxy test

.PHONY: pong
pong:
	$(MAKE) -C services/pong

.PHONY: pong-test
pong-test:
	$(MAKE) -C services/pong test

.PHONY: forward-interop
forward-interop:
	$(MAKE) -C services/forward-interop

.PHONY: forward-interop-test
forward-interop-test:
	$(MAKE) -C services/forward-interop test

.PHONY: imagery
imagery:
	$(MAKE) -C services/imagery

.PHONY: imagery-test
imagery-test:
	$(MAKE) -C services/imagery test

.PHONY: dashboard
dashboard:
	$(MAKE) -C services/dashboard

.PHONY: image-rec-master
image-rec-master:
	$(MAKE) -C services/image-rec-master

.PHONY: image-rec-master-test
image-rec-master-test:
	$(MAKE) -C services/image-rec-master test

.PHONY: image-rec-auto
image-rec-auto:
	$(MAKE) -C services/image-rec-auto

.PHONY: image-rec-auto-test
image-rec-auto-test:
	$(MAKE) -C services/image-rec-auto test

.PHONY: clean
clean:
	$(MAKE) -C services/mavproxy clean
	$(MAKE) -C services/telemetry clean
	$(MAKE) -C services/interop-proxy clean
	$(MAKE) -C services/pong clean
	$(MAKE) -C services/forward-interop clean
	$(MAKE) -C services/imagery clean
	$(MAKE) -C services/dashboard clean
	$(MAKE) -C services/image-rec-master clean
