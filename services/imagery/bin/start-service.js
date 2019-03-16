#!/usr/bin/env node

const logger = require('../lib/common/logger');

const Service = require('..');

let service = new Service({
  port: process.env.PORT,
  backend: process.env.BACKEND,
  imagerySyncHost: process.env.IMAGERY_SYNC_HOST,
  imagerySyncPort: process.env.IMAGERY_SYNC_PORT,
  telemetryHost: process.env.TELEMETRY_HOST,
  telemetryPort: process.env.TELEMETRY_PORT,
  printNew: process.env.PRINT_NEW in ['1', 'true', 'TRUE'],
  captureInterval: parseInt(process.env.CAPTURE_INTERVAL) || 2000,
  maxImages: parseInt(process.env.MAX_IMAGES) || 0
});

service.start()
  .catch((err) => {
    logger.error(`Could not start service: ${err.message}`);
    process.exit(1);
  });
