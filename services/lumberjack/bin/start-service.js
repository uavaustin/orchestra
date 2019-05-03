#!/usr/bin/env node

const Service = require('..');

let service = new Service({
  influxHost: process.env.INFLUX_HOST,
  influxPort: process.env.INFLUX_PORT,
  pingHost: process.env.PING_HOST,
  pingPort: process.env.PING_PORT,
  forwardInteropHost: process.env.FORWARD_INTEROP_HOST,
  forwardInteropPort: process.env.FORWARD_INTEROP_PORT,
  groundTelemetryHost: process.env.GROUND_TELEMETRY_HOST,
  groundTelemetryPort: process.env.GROUND_TELEMETRY_PORT,
  planeTelemetryHost: process.env.PLANE_TELEMETRY_HOST,
  planeTelemetryPort: process.env.PLANE_TELEMETRY_PORT,
  uploadInterval: process.env.UPLOAD_INTERVAL,
  pingInterval: process.env.PING_INTERVAL,
  telemInterval: process.env.TELEM_INTERVAL,
});

service.start();

process.once('SIGINT', () => service.stop());