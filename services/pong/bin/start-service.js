#!/usr/bin/env node

const Service = require('..');

const service = new Service({
  port: parseInt(process.env.PORT),
  serviceTimeout: parseInt(process.env.SERVICE_TIMEOUT),
  pingServices: process.env.PING_SERVICES.split(' ')
    .map((line) => {
      const split = line.split(',');

      // Add a default port of 80 and endpoint of /api/alive if
      // applicable.
      return {
        name: split[0],
        host: split[1].split(':')[0],
        port: parseInt(split[1].split(':')[1]) || 80,
        endpoint: split[2] || '/api/alive'
      };
    }),
  pingDevices: process.env.PING_DEVICES.split(' ')
    .map((line) => {
      const split = line.split(',');

      return { name: split[0], host: split[1] };
    }),
});

service.start();