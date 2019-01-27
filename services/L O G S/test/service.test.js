import nock from 'nock';
import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import Service from '/src/service';

addProtobuf(request);

beforeAll (async () => {
	service = new Service({
		name: test,
		host: '???',
		port: 7000,
		t1: 1,
		t5: 1,
		f1: 1,
		f5: 4
	})
});

await service.start();

test('check if the database is connected', async () => {

});

test('', async () => {

});

afterAll (async () => {

});