import addProtobuf from 'superagent-protobuf';
import Service from '../src/service';
import request from 'supertest';

let service;

// Bring the service up before other tests start.
test('start a new service instance', async () => {
  service = new Service({
    port: 5000,
    serviceTimeout: 7000,
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

afterAll(async () => {
  await service.stop();
});
