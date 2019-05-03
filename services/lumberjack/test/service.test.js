import addProtobuf from 'superagent-protobuf';
import request from 'supertest';
import nock from 'nock';
import Docker from 'dockerode';
import { stats } from '../src/messages';
import { telemetry } from '../src/messages';

import Service from '../src/service';

addProtobuf(request);

let docker;
let influxContainer;
let influxIP;
let service;
let pingApi;
let forwardInteropApi;
let telemetryApi;

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

  influxIP = (await influxContainer.inspect()).NetworkSettings.IPAddress;

  await new Promise(resolve => setTimeout(resolve, 4000));
}, 20000);

test('start up the service', async () => {
  service = new Service({
    port: 6000,
    pingHost: 'ping-test',
    pingPort: 7000,
    forwardInteropHost: 'forward-interop-test',
    forwardInteropPort: 4000,
    telemetryHost: 'telemetry-test',
    telemetryPort: 5000,
    influxHost: influxIP,
    influxPort: 8086,
    uploadInterval: 1000,
    telemInterval: 1000,
    pingInterval: 1000
  });

  await service.start();
}, 40000);

/*test('service is alive', async () => {
  let res = await request('http://localhost:6000')
    .get('/api/alive');

  expect(res.status).toEqual(200);
  expect(res.type).toEqual('text/plain');
  expect(res.text).toBeTruthy();
});*/

test('check ping requests', async () => {
  //time for one request
  pingApi = nock('http://ping-test:7000')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/ping').reply(200, p1)
    .get('/api/ping').reply(200, p1);

  await new Promise(resolve => setTimeout(resolve, 1000));
});

test('check forward-interop requests', async () => {
  forwardInteropApi = nock('http://forward-interop-test:4000')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/upload-rate').reply(200, f1)
    .get('/api/upload-rate').reply(200, f1);

  await new Promise(resolve => setTimeout(resolve, 1000));
});

test('check telemetry requests', async () => {
  telemetryApi = nock('http://telemetry-test:5000')
    .get('/api/overview').reply(200, t1)
    .get('/api/overview').reply(200, t1);

  await new Promise(resolve => setTimeout(resolve, 1000));
});

test('stop service', async () => {
  await service.stop();
  await influxContainer.stop();
  pingApi.done();
  forwardInteropApi.done();
  telemetryApi.done();
});
