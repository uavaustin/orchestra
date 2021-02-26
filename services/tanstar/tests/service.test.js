import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import flightField1 from './fixtures/flight-field1.json';

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

test('upload flight field 1', async () => {
  let res = await request('http://localhost:5000')
    .post('/api/flight-field')
    .sendProto(pathfinder.FlightField.create(flightField1));

  expect(res.status).toEqual(200);
});

afterAll(async () => {
  await service.stop();
});
