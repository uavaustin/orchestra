import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import flightField1 from './fixtures/flight-field1.json';
import plane1 from './fixtures/plane1.json';
import mission1 from './fixtures/mission1.json';

import Service from '../src/service';
import { pathfinder } from '../src/messages';

let service;

// Bring the service up before other tests start.
test('start a new service instance', async () => {
  service = new Service({
    port: 5000,
    serviceTimeout: 10000,
    InteropProxyHost: 'interop-proxy',
    InteropProxyPort: 8989
  });

  await service.start();
}, 4000);

test('service is alive', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/alive');

  expect(res.status).toEqual(200);
  expect(res.type).toEqual('text/plain');
  expect(res.text).toBeTruthy();
});

test('upload mission 1', async () => {
  const msg = pathfinder.Mission.create(mission1);
  console.log(msg);
  console.log(msg.waypoints);

  let res = await request('http://localhost:5000')
  .post('/api/mission')
  .sendProto(pathfinder.Mission.create(mission1));

  expect(res.status).toEqual(200);
});

test('return mission 1', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/mission')
    .proto(pathfinder.Mission);

    expect(res.status).toEqual(200);
    console.log(res.body);

    expect(res.body.waypoints).toEqual(mission1.waypoints);
});

test('return mission 1 adjusted', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/mission')
    .proto(pathfinder.Mission);

    expect(res.status).toEqual(200);
    console.log(res.body);

    expect(res.body.waypoints).toEqual(); // TODO: fill expected
});

test('upload plane 1', async () => {
  const msg = pathfinder.Plane.create(plane1);
  console.log(msg);

  let res = await request('http://localhost:5000')
    .post('/api/plane')
    .sendProto(pathfinder.Plane.create(plane1));

    expect(res.status).toEqual(200);
});


test('return plane 1', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/plane')
    .proto(pathfinder.Plane);

  expect(res.status).toEqual(200);
  console.log(res.body);

  expect(res.body.altitude).toEqual(plane1.altitude);
  expect(res.body.pos).toEqual(plane1.pos);
});



test('upload flight field 1', async () => {
  const msg = pathfinder.FlightField.create(flightField1);
  console.log(msg);


  let res = await request('http://localhost:5000')
    .post('/api/flight-field')
    .sendProto(pathfinder.FlightField.create(flightField1));

  expect(res.status).toEqual(200);
});

test('return flight field 1', async () => {
  let res = await request('http://localhost:5000')
    .get('/api/flight-field')
    .proto(pathfinder.FlightField);

  expect(res.status).toEqual(200);
  console.log(res.body);

  expect(res.body.flyzones).toEqual(flightField1.flyzones);
  expect(res.body.obstacles).toEqual(flightField1.obstacles);

});

afterAll(async () => {
  await service.stop();
});
