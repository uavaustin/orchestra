import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import { telemetry } from '../src/messages';

import Service from '../src/service';

import rawMission1 from './fixtures/raw-mission-1.json';
import rawMission2 from './fixtures/raw-mission-2.json';
import rawMission3 from './fixtures/raw-mission-3.json';

addProtobuf(request);

let service = new Service({
  port: 5000,
  planeHost: process.env.PLANE_HOST,
  planePort: process.env.PLANE_PORT
});

// Bring the service up before tests start.
beforeAll(async () => {
  await service.start();

  // Wait until the service gives a response.
  let connected = false;

  while (!connected) {
    try {
      await request('http://localhost:5000').get('/api/alive');
      connected = true;
    } catch (_err) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
}, 20000);

// Take down the service once the service tests are done.
afterAll(async () => {
  await service.stop();
});

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
