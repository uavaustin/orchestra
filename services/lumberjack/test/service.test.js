import nock from 'nock';
import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import Service from '/src/service';

addProtobuf(request);

beforeAll (async () => {
	service = new Service({
		influxhost: 'localhost',
		influxport: 3000,
		pinghost: 'lol'
		pingport: 2000, 
		telemport: 'lmao',
		telemhost: 4000
	})
});

await service.start();

test('', async () => {
	

	influx.query('select * from ping').then(results => {
		expect(results[0].toEqual('test1'));
		expect(results[1].toEqual('dne'));
		expect(results[2].toEqual(5));
		expect(results[3].toEqual(10));
	})
});

test('', async () => {

});

afterAll (async () => {

});