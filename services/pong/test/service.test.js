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
let device;
let deviceIP;

/*
Contains information for all test services
Service Info: [name], [host ip], [port], [endpoint]
Result Info: [online status], [ms lower bound], [ms upper bound]
*/
let serviceOutputs = [
  ['test1', 'test1-service', '7001', '/api/alive', true, 0, 1000],
  ['test2', 'test2-service', '7002', '/custom', true, 0, 1000],
  ['no-endpoint', 'no-endpoint-service', '7003', '/no-exist', false, -1, 1],
  ['non-existent', 'non-existent-service', '12345', '/', false, -1, 1],
  ['meta', '127.0.0.1', '7000', '/api/alive', true, 0, 1000],
];

/*
Contains information for all test devices
Service Info: [name], [host ip]
Result Info: [online status], [ms lower bound], [ms upper bound]
*/
let deviceOutputs = [
  ['device1', deviceIP, true, 0, 1000],
  ['device2', '127.0.0.1', true, 0, 1000],
  ['google', 'google.com', true, 0, 10000],
  ['non-existent-device', 'no-host', false, -1, 1],
  ['test', '1.1.1.1', true, 0, 10000],
];

beforeAll(async () => {
  const docker = new Docker();
  device = await docker.createContainer({ Image: 'alpine' });
  await device.start();

  deviceIP = (await device.inspect()).NetworkSettings.IPAddress;
  //Required because deviceIP is undefined before this
  deviceOutputs[0][1] = deviceIP;

  // Sets the properties of each service. Returns array
  let serviceValues = () => {
    let serviceInitial = [];
    for (let serviceNum of serviceOutputs) {
      serviceInitial.push({
        name: serviceNum[0],
        host: serviceNum[1],
        port: serviceNum[2],
        endpoint: serviceNum[3]
      });
    }
    return serviceInitial;
  };

  // Sets the properties of each device. Returns array
  let deviceValues = () => {
    let deviceInitial = [];
    for (let deviceNum of deviceOutputs) {
      deviceInitial.push({
        name: deviceNum[0],
        host: deviceNum[1]
      });
    }
    return deviceInitial;
  };

  // Creates service
  service = new Service({
    port: 7000,
    pingServices: serviceValues(),
    pingDevices: deviceValues()
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

  // Checks returned values with expected values for all services
  for (let i = 0; i < service_pings.length; i++) {
    expect(service_pings[i].name).toEqual(serviceOutputs[i][0]);
    expect(service_pings[i].host).toEqual(serviceOutputs[i][1]);
    expect(service_pings[i].port).toEqual(serviceOutputs[i][2]);
    expect(service_pings[i].online).toEqual(serviceOutputs[i][4]);
    expect(service_pings[i].ms).toBeGreaterThan(serviceOutputs[i][5]);
    expect(service_pings[i].ms).toBeLessThan(serviceOutputs[i][6]);
  }
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

  // Checks returned values with expected values for all devices
  for (let i = 0; i < device_pings.length; i++) {
    expect(device_pings[i].name).toEqual(deviceOutputs[i][0]);
    expect(device_pings[i].host).toEqual(deviceOutputs[i][1]);
    expect(device_pings[i].online).toEqual(deviceOutputs[i][2]);
    expect(device_pings[i].ms).toBeGreaterThan(deviceOutputs[i][3]);
    expect(device_pings[i].ms).toBeLessThan(deviceOutputs[i][4]);
  }
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
