import nock from 'nock';
import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import { stats } from '../src/messages';

import Service from '../src/service';

addProtobuf(request);

let service;
let aliveApi;
let customApi;
let noEndpointApi;

beforeAll(async () => {
  service = new Service({
    port: 7000,
    pingServices: [
      {
        name: 'test1',
        host: 'test1-service',
        port: 7001,
        endpoint: '/api/alive'
      },
      {
        name: 'test2',
        host: 'test2-service',
        port: 7002,
        endpoint: '/custom'
      },
      {
        name: 'no-endpoint',
        host: 'no-endpoint-service',
        port: 7003,
        endpoint: '/no-exist'
      },
      {
        name: 'non-existent',
        host: 'non-existent-service',
        port: 12345,
        endpoint: '/'
      },
      {
        name: 'meta',
        host: '127.0.0.1',
        port: 7000,
        endpoint: '/api/alive'
      }
    ]
  });

  aliveApi = nock('http://test1-service:7001')
    .get('/api/alive')
    .reply(200);

  customApi = nock('http://test2-service:7002')
    .get('/custom')
    .reply(302);

  noEndpointApi = nock('http://no-endpoint-service');

  await service.start();

  // Allow a little time to get things up and running.
  await new Promise(resolve => setTimeout(resolve, 100));
});

test('check the protobuf response', async () => {
  let res = await request('http://127.0.0.1:7000')
    .get('/api/ping')
    .proto(stats.PingTimes);

  expect(res.status).toEqual(200);

  let list = res.body.list;

  expect(list[0].name).toEqual('meta');
  expect(list[0].host).toEqual('127.0.0.1');
  expect(list[0].port).toEqual('7000');
  expect(list[0].online).toEqual(true);
  expect(list[0].ms).toBeGreaterThan(0);
  expect(list[0].ms).toBeLessThan(1000);

  expect(list[1].name).toEqual('no-endpoint');
  expect(list[1].host).toEqual('no-endpoint-service');
  expect(list[1].port).toEqual('7003');
  expect(list[1].online).toEqual(false);
  expect(list[1].ms).toEqual(0);

  expect(list[2].name).toEqual('non-existent');
  expect(list[2].host).toEqual('non-existent-service');
  expect(list[2].port).toEqual('12345');
  expect(list[2].online).toEqual(false);
  expect(list[2].ms).toEqual(0);

  expect(list[3].name).toEqual('test1');
  expect(list[3].host).toEqual('test1-service');
  expect(list[3].port).toEqual('7001');
  expect(list[3].online).toEqual(true);
  expect(list[3].ms).toBeGreaterThan(0);
  expect(list[3].ms).toBeLessThan(1000);

  expect(list[4].name).toEqual('test2');
  expect(list[4].host).toEqual('test2-service');
  expect(list[4].port).toEqual('7002');
  expect(list[4].online).toEqual(true);
  expect(list[4].ms).toBeGreaterThan(0);
  expect(list[4].ms).toBeLessThan(1000);
});

test('mock apis were hit correctly', () => {
  aliveApi.done();
  customApi.done();
  noEndpointApi.done();
});

afterAll(async () => {
  await service.stop();
});
