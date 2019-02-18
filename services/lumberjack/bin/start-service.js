#!/usr/bin/env node

const Service = require('..');

let service = new Service({
  influxPort: process.env.INFLUX_PORT,
  influxHost: process.env.INFLUX_HOST
});

service.start();

process.once('SIGINT', () => service.stop());