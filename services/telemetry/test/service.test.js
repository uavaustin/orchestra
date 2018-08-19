import Docker from 'dockerode';
import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import { telemetry } from '../src/messages';

import Service from '../src/service';

import rawMission1 from './fixtures/raw-mission-1.json';
import rawMission2 from './fixtures/raw-mission-2.json';
import rawMission3 from './fixtures/raw-mission-3.json';

addProtobuf(request);

// Docker client connecting to /var/run/docker.sock.
let docker = new Docker();

// Plane sitl container used for testing.
let planeSitl;
let planeIp;

let service;

// Start a plane-sitl container.
beforeAll(async () => {
  planeSitl = await docker.createContainer({ Image: 'uavaustin/plane-sitl' });
  await planeSitl.start();

  planeIp = (await planeSitl.inspect()).NetworkSettings.IPAddress;
}, 10000);

// Stop the plane-sitl container.
afterAll(async () => {
  await planeSitl.remove({ force: true });
}, 10000);

// Bring the service up before other tests start.
test('start a new service instance', async () => {
  service = new Service({
    port: 5000,
    planeHost: planeIp,
    planePort: '14550'
  });

  await service.start();
}, 40000);

// Basic checks if raw mission lengths are the same after setting and
// getting.

test('upload raw mission 1', async () => {
  let res = await request('http://localhost:5000')
    .post('/api/raw-mission')
    .sendProto(telemetry.RawMission.create(rawMission1));

  expect(res.status).toEqual(200);
});

test('download raw mission 1', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/raw-mission')
    .proto(telemetry.RawMission);

  expect(res.status).toEqual(200);
  expect(res.body.mission_items)
    .toHaveLength(rawMission1.mission_items.length);
});

test('upload raw mission 2', async () => {
  let res = await request('http://localhost:5000')
    .post('/api/raw-mission')
    .sendProto(telemetry.RawMission.create(rawMission2));

  expect(res.status).toEqual(200);
});

test('download raw mission 2', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/raw-mission')
    .proto(telemetry.RawMission);

  expect(res.status).toEqual(200);
  expect(res.body.mission_items)
    .toHaveLength(rawMission2.mission_items.length);
});

test('upload raw mission 3', async () => {
  let res = await request('http://localhost:5000')
    .post('/api/raw-mission')
    .sendProto(telemetry.RawMission.create(rawMission3));

  expect(res.status).toEqual(200);
});

test('download raw mission 3', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/raw-mission')
    .proto(telemetry.RawMission);

  expect(res.status).toEqual(200);
  expect(res.body.mission_items)
    .toHaveLength(rawMission3.mission_items.length);
});

// Take down the service once the other service tests are done.
test('stop the service', async () => {
  await service.stop();
});
