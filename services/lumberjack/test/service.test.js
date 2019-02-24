import addProtobuf from 'superagent-protobuf';
import request from 'supertest';
import influx from 'influx';

import Service from '../src/service';

addProtobuf(request);

let service;

beforeAll (async () => {
  service = new Service({
    influxServices: [
      {
        pingHost: 'test1',
        pingPort: '7000',
        telemHost: 1,
        telemPort: 2,
        influxHost: 3,
        influxPort: 4,
      }
    ]
  });
  await service.start();
}, 10000);

test('Basic test for influxDB ', async () => {
  console.log('oof'); // eslint-disable-line no-console
  influx.ping(7000).then(hosts => {
    hosts.forEach(host => {
      if (host.online) {
        console.log('${host.url.host} responded in'); //eslint-disable-line
        console.log('${host.rtt}ms running ${host.version}'); // eslint-disable-line 
      } else {
        console.log('${host.url.host} is offline'); // eslint-disable-line 
      }
    });
  });

  influx.query('select * from pings').then(results => {
    expect(results[0]).toEqual('test1');
    expect(results[1]).toEqual('dne');
    expect(results[2]).toEqual(1);
    expect(results[3]).toEqual(2);
    expect(results[4]).toEqual(3);
    expect(results[5]).toEqual(4);
    expect(results[100]).toEqual(4);
  });
});

test('InfluxDB multiple data test', async () => {

});

afterAll (async () => {
  await service.stop();
});
