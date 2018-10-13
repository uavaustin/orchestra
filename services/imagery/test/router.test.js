import Koa from 'koa';
import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import { imagery } from '../src/messages';

import router from '../src/router';

addProtobuf(request);

test('get the latest image with GET /api/image/latest', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  const imageData = Buffer.from([0x01, 0x09]);
  const imageMeta = imagery.Image.create({ id: 3 });
  const image = imagery.Image.create({ id: 3, image: imageData });

  app.context.imageStore = {
    getCount: jest.fn().mockReturnValueOnce(4),
    getImage: jest.fn().mockReturnValueOnce(imageData),
    getMetadata: jest.fn().mockReturnValueOnce(imageMeta)
  };

  const server = app.listen();

  try {
    await request(server)
      .get('/api/image/latest')
      .proto(imagery.Image)
      .expect(200, image);

    expect(app.context.imageStore.getImage).toBeCalledWith(3);
    expect(app.context.imageStore.getMetadata).toBeCalledWith(3);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});

test('get the next image with GET /api/image/next', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  const imageData = Buffer.from([0x02, 0x08]);
  const imageMeta = imagery.Image.create({ id: 5 });
  const image = imagery.Image.create({ id: 5, image: imageData });

  app.context.imageStore = {
    once: jest.fn((_event, cb) => setImmediate(() => cb(5))),
    getCount: jest.fn().mockReturnValueOnce(7),
    getImage: jest.fn().mockReturnValueOnce(imageData),
    getMetadata: jest.fn().mockReturnValueOnce(imageMeta)
  };

  const server = app.listen();

  try {
    await request(server)
      .get('/api/image/next')
      .proto(imagery.Image)
      .expect(200, image);

    expect(app.context.imageStore.once.mock.calls[0][0]).toEqual('image');
    expect(app.context.imageStore.getImage).toBeCalledWith(5);
    expect(app.context.imageStore.getMetadata).toBeCalledWith(5);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});

test('get the image by id with GET /api/image/:id', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  const imageData = Buffer.from([0x02, 0x09]);
  const imageMeta = imagery.Image.create({ id: 2 });
  const image = imagery.Image.create({ id: 2, image: imageData });

  app.context.imageStore = {
    getCount: jest.fn().mockReturnValueOnce(4),
    getImage: jest.fn().mockReturnValueOnce(imageData),
    getMetadata: jest.fn().mockReturnValueOnce(imageMeta)
  };

  const server = app.listen();

  try {
    await request(server)
      .get('/api/image/2')
      .proto(imagery.Image)
      .expect(200, image);

    expect(app.context.imageStore.getImage).toBeCalledWith(2);
    expect(app.context.imageStore.getMetadata).toBeCalledWith(2);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});
