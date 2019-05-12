import nock from 'nock';
import Docker from 'dockerode';
import { stats } from '../src/messages';
import { telemetry } from '../src/messages';

import Service from '../src/service';

let docker;
let influxContainer;
let influxIP;
let service;
let pingApi;
let forwardInteropApi;
let groundTelemetryApi;
let planeTelemetryApi;

let p1 = stats.PingTimes.encode({
  time: 1,
  list: { name: 2, host: 3, port: 4, online: 5, ms: 6 },
  service_pings: { name: 7, host: 8, port: 9, online: 10, ms: 11 },
  device_pings: { name: 12, host: 13, online: 14, ms: 15 }
}).finish();
let f1 = stats.InteropUploadRate.encode({
  time: 2, total_1: 3, fresh_1: 4, total_5: 5, fresh_5: 6
}).finish();
let t1 = telemetry.Overview.encode({
  time: 3, pos: 4, rot: 5, alt: 6, vel: 7, speed: 8, battery: 9
}).finish();

beforeAll(async () => {
  docker = new Docker();

  influxContainer = await docker.createContainer(
    { Image: 'influxdb:alpine' });

  await influxContainer.start();
  await new Promise(resolve => setTimeout(resolve, 2000));

  influxIP = (await influxContainer.inspect()).NetworkSettings.IPAddress;

  service = new Service({
    pingHost: 'ping-test',
    pingPort: 7000,
    forwardInteropHost: 'forward-interop-test',
    forwardInteropPort: 4000,
    groundTelemetryHost: 'telemetry-test',
    groundTelemetryPort: 5000,
    planeTelemetryHost: 'plane-telemetry-test',
    planeTelemetryPort: 5000,
    influxHost: influxIP,
    influxPort: 8086,
    uploadInterval: 1000,
    telemInterval: 1000,
    pingInterval: 1000,
    dbName: 'lumberjack'
  });

  pingApi = nock('http://ping-test:7000')
    .persist()
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/ping').reply(200, p1);

  forwardInteropApi = nock('http://forward-interop-test:4000')
    .persist()
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/upload-rate').reply(200, f1);

  groundTelemetryApi = nock('http://telemetry-test:5000')
    .persist()
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/overview').reply(200, t1);

  planeTelemetryApi = nock('http://plane-telemetry-test:5000')
    .persist()
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/overview').reply(200, t1);

  await service.start();
  await new Promise(resolve => setTimeout(resolve, 2000));
}, 20000);

test('check ping requests', async () => {
  expect(pingApi.isDone()).toBeTruthy();
});

test('check forward-interop requests', async () => {
  expect(forwardInteropApi.isDone()).toBeTruthy();
});

test('check ground telemetry requests', async () => {
  expect(groundTelemetryApi.isDone()).toBeTruthy();
});

test('check plane telemetry requests', async () => {
  expect(planeTelemetryApi.isDone()).toBeTruthy();
});

test('stop service', async () => {
  await service.stop();
  await influxContainer.stop();
  pingApi.done();
  forwardInteropApi.done();
  groundTelemetryApi.done();
  planeTelemetryApi.done();
});
