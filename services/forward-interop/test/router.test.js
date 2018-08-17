import Koa from 'koa';
import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import { stats } from '../src/messages';

import router from '../src/router';

addProtobuf(request);

test('get text from GET /api/alive', async () => {
  let app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  let server = app.listen();

  try {
    let res = await request(server).get('/api/alive');

    expect(res.status).toEqual(200);
    expect(res.type).toEqual('text/plain');
    expect(res.text).toEqual('Yo dude, I\'m good.\n');
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});

test('get the upload rate from GET /api/upload-rate', async () => {
  let app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  let testRate = stats.InteropUploadRate.create({
    time: 1, total_1: 2, total_5: 3, fresh_1: 4, fresh_5: 5
  });

  app.context.uploadMonitor = {
    getUploadRate: jest.fn().mockReturnValue(testRate)
  };

  let server = app.listen();

  try {
    let res = await request(server)
      .get('/api/upload-rate')
      .proto(stats.InteropUploadRate);

    expect(res.status).toEqual(200);
    expect(res.type).toEqual('application/x-protobuf');
    expect(res.body).toEqual(testRate);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});
