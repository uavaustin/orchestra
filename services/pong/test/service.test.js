import Docker from 'dockerode';
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
let docker;
let device;
let deviceIP;

beforeAll(async () => {
  docker = new Docker();
  device = await docker.createContainer({ Image: 'alpine' });
  await device.start();

  deviceIP = (await device.inspect()).NetworkSettings.IPAddress;

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
    ],
    pingDevices: [
      {
        name: 'device1',
        host: deviceIP
      },
      {
        name: 'device2',
        host: '127.0.0.1'
      },
      {
        name: 'non-existent-device',
        host: 'no-host'
      },

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

}, 10000);

test('check the service ping response', async () => {
  let res = await request('http://127.0.0.1:7000')
    .get('/api/ping')
    .proto(stats.PingTimes);

  expect(res.status).toEqual(200);

  let service_pings = res.body.service_pings;

  expect(service_pings).toEqual(res.body.list);

  expect(service_pings[0].name).toEqual('meta');
  expect(service_pings[0].host).toEqual('127.0.0.1');
  expect(service_pings[0].port).toEqual('7000');
  expect(service_pings[0].online).toEqual(true);
  expect(service_pings[0].ms).toBeGreaterThan(0);
  expect(service_pings[0].ms).toBeLessThan(1000);

  expect(service_pings[1].name).toEqual('no-endpoint');
  expect(service_pings[1].host).toEqual('no-endpoint-service');
  expect(service_pings[1].port).toEqual('7003');
  expect(service_pings[1].online).toEqual(false);
  expect(service_pings[1].ms).toEqual(0);

  expect(service_pings[2].name).toEqual('non-existent');
  expect(service_pings[2].host).toEqual('non-existent-service');
  expect(service_pings[2].port).toEqual('12345');
  expect(service_pings[2].online).toEqual(false);
  expect(service_pings[2].ms).toEqual(0);

  expect(service_pings[3].name).toEqual('test1');
  expect(service_pings[3].host).toEqual('test1-service');
  expect(service_pings[3].port).toEqual('7001');
  expect(service_pings[3].online).toEqual(true);
  expect(service_pings[3].ms).toBeGreaterThan(0);
  expect(service_pings[3].ms).toBeLessThan(1000);

  expect(service_pings[4].name).toEqual('test2');
  expect(service_pings[4].host).toEqual('test2-service');
  expect(service_pings[4].port).toEqual('7002');
  expect(service_pings[4].online).toEqual(true);
  expect(service_pings[4].ms).toBeGreaterThan(0);
  expect(service_pings[4].ms).toBeLessThan(1000);
});

test('check the device ping response', async () => {
  /*
  Mock pingDevice
  Call the pingDevice function with some devices and
  Check that device_pings is good
  */
  let res = await request('http://127.0.0.1:7000')
    .get('/api/ping')
    .proto(stats.PingTimes);

  expect(res.status).toEqual(200);

  let device_pings = res.body.device_pings;

  expect(device_pings[0].name).toEqual('device1');
  expect(device_pings[0].host).toEqual(deviceIP);
  expect(device_pings[0].online).toEqual(true);
  expect(device_pings[0].ms).toBeGreaterThan(0);
  expect(device_pings[0].ms).toBeLessThan(1000);

  expect(device_pings[1].name).toEqual('device2');
  expect(device_pings[1].host).toEqual('127.0.0.1');
  expect(device_pings[1].online).toEqual(true);
  expect(device_pings[1].ms).toBeGreaterThan(0);
  expect(device_pings[1].ms).toBeLessThan(1000);

  expect(device_pings[2].name).toEqual('non-existent-device');
  expect(device_pings[2].host).toEqual('no-host');
  expect(device_pings[2].online).toEqual(false);
  expect(device_pings[2].ms).toEqual(0);
});

test('mock apis were hit correctly', () => {
  aliveApi.done();
  customApi.done();
  noEndpointApi.done();
});

afterAll(async () => {
  await service.stop();
  await device.remove({ force: true });
}, 10000);
