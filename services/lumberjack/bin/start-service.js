#!/usr/bin/env node

const Service = require('..');

let service = new Service({
  influxHost: process.env.INFLUX_HOST,
  influxPort: process.env.INFLUX_PORT,
  pingHost: process.env.PING_HOST,
  pingPort: process.env.PING_PORT,
  forwardInteropHost: process.env.FORWARD_INTEROP_HOST,
  forwardInteropPort: process.env.FORWARD_INTEROP_PORT,
  telemetryHost: process.env.TELEMETRY_HOST,
  telemetryPort: process.env.TELEMETRY_PORT,
  planeTelemHost: process.env.PLANE_TELEMETRY_HOST,
  planeTelemPort: process.env.PLANE_TELEMETRY_PORT
});

service.start();

process.once('SIGINT', () => service.stop());