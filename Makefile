# See service level Makefiles for more fine-grained control. Note
# that they do not take care of any prerequisites as that is done
# here.

.PHONY: all
all: mavproxy telemetry interop-proxy pong forward-interop imagery dashboard

.PHONY: test
test: interop-proxy-test pong-test

.PHONY: protoc
protoc:
	$(MAKE) -C tools/protoc

.PHONY: mavproxy
mavproxy:
	$(MAKE) -C services/mavproxy

.PHONY: telemetry
telemetry: protoc
	$(MAKE) -C services/telemetry

.PHONY: interop-proxy
interop-proxy: protoc
	$(MAKE) -C services/interop-proxy

.PHONY: interop-proxy-test
interop-proxy-test: protoc
	$(MAKE) -C services/interop-proxy test

.PHONY: pong
pong: protoc
	$(MAKE) -C services/pong

.PHONY: pong-test
pong-test: protoc
	$(MAKE) -C services/pong test

.PHONY: forward-interop
forward-interop: protoc
	$(MAKE) -C services/forward-interop

.PHONY: imagery
imagery:
	$(MAKE) -C services/imagery

.PHONY: dashboard
dashboard: protoc
	$(MAKE) -C services/dashboard

.PHONY: clean
clean:
	$(MAKE) -C tools/protoc clean
	$(MAKE) -C tools/mavproxy clean
	$(MAKE) -C services/telemetry clean
	$(MAKE) -C services/interop-proxy clean
	$(MAKE) -C services/pong clean
	$(MAKE) -C services/forward-interop clean
	$(MAKE) -C services/imagery clean
	$(MAKE) -C services/dashboard clean
