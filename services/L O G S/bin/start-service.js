#!/usr/bin/env node

const Service = require('..');

let service = new Service({
  port: process.env.PORT
});

service.start();

process.once('SIGINT', () => service.close());