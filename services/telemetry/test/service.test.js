import Docker from 'dockerode';
import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import { interop, telemetry } from '../src/messages';

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

test('service is alive', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/alive');

  expect(res.status).toEqual(200);
  expect(res.type).toEqual('text/plain');
  expect(res.text).toBeTruthy();
});

test('mission item is zero when no mission is on the plane', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/mission-current')
    .proto(telemetry.MissionCurrent);

  expect(res.status).toEqual(200);
  expect(res.body.item_number).toEqual(0);
});

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

test('set the current mission item to 4', async () => {
  let res = await request('http://localhost:5000')
    .post('/api/mission-current')
    .sendProto(telemetry.MissionCurrent.create({ item_number: 4 }));

  expect(res.status).toEqual(200);
});

test('fetch the uploaded mission item', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/mission-current')
    .proto(telemetry.MissionCurrent);

  expect(res.status).toEqual(200);
  expect(res.body.item_number).toEqual(4);
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

test('download raw mission 2 concurrently', async () => {
  let dl = async () => {
    let res = await request('http://localhost:5000')
      .get('/api/raw-mission')
      .proto(telemetry.RawMission);

    expect(res.status).toEqual(200);
    expect(res.body.mission_items)
      .toHaveLength(rawMission2.mission_items.length);
  };

  await Promise.all([
    dl(), dl(), dl()
  ]);
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

test('get interop telemetry', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/interop-telem')
    .proto(interop.InteropTelem);

  expect(res.status).toEqual(200);
  expect(res.body.pos.lat).toBeTruthy();
});

test('get camera telemetry', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/camera-telem')
    .proto(telemetry.CameraTelem);

  expect(res.status).toEqual(200);
  expect(res.body.lat).toBeTruthy();
});

test('get overview telemetry', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/overview')
    .proto(telemetry.Overview);

  expect(res.status).toEqual(200);
  expect(res.body.pos.lat).toBeTruthy();
});

// Take down the service once the other service tests are done.
test('stop the service', async () => {
  await service.stop();
});
