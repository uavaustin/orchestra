#!/usr/bin/env node

let service = new Service({
  port: process.env.PORT,
  planeHost: process.env.PLANE_HOST,
  planePort: parseInt(process.env.PLANE_PORT)
});

service.start();
