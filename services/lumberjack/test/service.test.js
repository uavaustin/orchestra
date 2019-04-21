import addProtobuf from 'superagent-protobuf';
import request from 'supertest';
import influx from 'influx';

import Service from '../src/service';

addProtobuf(request);

let service;

beforeAll (async () => {
  service = new Service({
    port: 6000,
    influxHost: 'localhost',
    influxPort: 8086
  });
  await service.start();
}, 10000);

test('Basic test for influxDB ', async () => {
  //mock http requests
  //unit testing is trying to cover every line in code
});

test('InfluxDB multiple data test', async () => {

});

afterAll (async () => {
  await service.stop();
});
