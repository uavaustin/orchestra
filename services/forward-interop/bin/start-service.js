#!/usr/bin/env node

const Service = require('..');

let service = new Service({
  port: process.env.PORT,
  telemetryHost: process.env.TELEMETRY_HOST,
  telemetryPort: parseInt(process.env.TELEMETRY_PORT),
  interopProxyHost: process.env.INTEROP_PROXY_HOST,
  interopProxyPort: parseInt(process.env.INTEROP_PROXY_PORT)
});

service.start();

process.once('SIGINT', () => service.close());
