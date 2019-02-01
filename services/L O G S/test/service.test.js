import nock from 'nock';
import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import Service from '/src/service';

addProtobuf(request);

beforeAll (async () => {
	serviceone = new Service({
		name: 'test1',
		host: 'dne',
		port: 7000,
		t1: 1,
		t5: 1,
		f1: 1,
		f5: 4
	}),
	servicetwo = new Service({
		name: 'test2',
		host: 'localhost',
		port: 7000,
		t1: 3,
		t5: 2,
		f1: 1,
		f5: 3
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