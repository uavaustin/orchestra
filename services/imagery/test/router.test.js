import Koa from 'koa';
import addProtobuf from 'superagent-protobuf';
import request from 'supertest';

import { imagery, stats } from '../src/messages';

import router from '../src/router';

addProtobuf(request);

test('get text with GET /api/alive', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  const server = app.listen();

  try {
    await request(server)
      .get('/api/alive')
      .expect(200, /.+\.\n/);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});

test('turn image capture on with POST /api/start-capture', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  const server = app.listen();

  try {
    // Subtest: 200 OK when image capture is off
    app.context.backend = {
      getActive: jest.fn().mockReturnValue(false),
      start: jest.fn().mockResolvedValue()
    };
    await request(server)
      .post('/api/start-capture')
      .expect(200, /.+\.\n/);

    // Subtest: 100 Continue when image capture is already on
    app.context.backend = {
      getActive: jest.fn().mockReturnValue(true)
    };
    await request(server)
      .post('/api/start-capture')
      .expect(200, /.+\.\n/);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});

test('turn image capture off with POST /api/stop-capture', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  const server = app.listen();

  try {
    // Subtest: 200 OK when image capture is on
    app.context.backend = {
      getActive: jest.fn().mockReturnValue(true),
      stop: jest.fn().mockResolvedValue()
    };
    await request(server)
      .post('/api/stop-capture')
      .expect(200, /.+\.\n/);

    // Subtest: 100 Continue when image capture is already off
    app.context.backend = {
      getActive: jest.fn().mockReturnValue(false)
    };
    await request(server)
      .post('/api/stop-capture')
      .expect(200, /.+\.\n/);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});

test('get count with GET /api/count', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.context.imageStore = {
    getCount: jest.fn().mockReturnValueOnce(5)
  };

  const server = app.listen();

  try {
    const { body: msg } =
      await request(server)
        .get('/api/count')
        .proto(imagery.ImageCount)
        .expect(200);

    expect(msg.count).toEqual(5);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});

test('get available images with GET /api/available', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.context.imageStore = {
    getAvailable: jest.fn().mockReturnValue([0, 1, 2, 3, 4, 5])
  };

  const server = app.listen();

  try {
    const { body: msg } =
      await request(server)
        .get('/api/available')
        .proto(imagery.AvailableImages)
        .expect(200);

    expect(msg.count).toEqual(6);
    expect(msg.id_list).toEqual([0, 1, 2, 3, 4, 5]);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});

test('get image capture rate with GET /api/capture-rate', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  app.context.imageStore = {
    getRate: jest.fn().mockReturnValueOnce(0.4)
  };

  const server = app.listen();

  try {
    const { body: msg } =
      await request(server)
        .get('/api/capture-rate')
        .proto(stats.ImageCaptureRate)
        .expect(200);

    expect(msg.rate_5).toEqual(0.4);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});

test('get the latest image with GET /api/image/latest', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  const imageData = Buffer.from([0x01, 0x09]);
  const imageMeta = imagery.Image.create({ id: 3 });
  const image = imagery.Image.create({ id: 3, image: imageData });

  app.context.imageStore = {
    getImage: jest.fn().mockReturnValueOnce(imageData),
    getMetadata: jest.fn().mockReturnValueOnce(imageMeta),
    getLatestId: jest.fn().mockReturnValueOnce(Promise.resolve(3))
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

  const server = app.listen();

  try {
    // Subtest: 200 OK on found image
    const imageData = Buffer.from([0x02, 0x09]);
    const imageMeta = imagery.Image.create({ id: 2 });
    const image = imagery.Image.create({ id: 2, image: imageData });

    app.context.imageStore = {
      getCount: jest.fn().mockReturnValueOnce(4),
      getImage: jest.fn().mockReturnValueOnce(imageData),
      getMetadata: jest.fn().mockReturnValueOnce(imageMeta),
      exists: jest.fn().mockReturnValueOnce(Promise.resolve(true)),
      deleted: jest.fn().mockReturnValueOnce(Promise.resolve(false))
    };

    await request(server)
      .get('/api/image/2')
      .proto(imagery.Image)
      .expect(200, image);

    expect(app.context.imageStore.getImage).toBeCalledWith(2);
    expect(app.context.imageStore.getMetadata).toBeCalledWith(2);
    expect(app.context.imageStore.exists).toBeCalledWith(2);

    // Subtest: 404 when image does not exist
    app.context.imageStore = {
      exists: jest.fn().mockReturnValueOnce(Promise.resolve(false)),
      deleted: jest.fn().mockReturnValueOnce(Promise.resolve(false))
    };

    await request(server)
      .get('/api/image/2')
      .proto(imagery.Image)
      .expect(404);

    expect(app.context.imageStore.exists).toBeCalledWith(2);

    // Subtest: 410 when image does not exist
    app.context.imageStore = {
      exists: jest.fn().mockReturnValueOnce(Promise.resolve(true)),
      deleted: jest.fn().mockReturnValueOnce(Promise.resolve(true))
    };

    await request(server)
      .get('/api/image/2')
      .proto(imagery.Image)
      .expect(410);

    expect(app.context.imageStore.exists).toBeCalledWith(2);
    expect(app.context.imageStore.deleted).toBeCalledWith(2);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});

test('delete an image by id with DELETE /api/image/:id', async () => {
  const app = new Koa();

  app.use(router.routes());
  app.use(router.allowedMethods());

  const server = app.listen();

  try {
    // Subtest: 200 OK when image exists
    app.context.imageStore = {
      exists: jest.fn().mockReturnValueOnce(Promise.resolve(true)),
      deleted: jest.fn().mockReturnValueOnce(Promise.resolve(false)),
      deleteImage: jest.fn().mockReturnValueOnce(Promise.resolve(true))
    };

    await request(server)
      .delete('/api/image/2')
      .proto(imagery.Image)
      .expect(200);

    expect(app.context.imageStore.exists).toBeCalledWith(2);
    expect(app.context.imageStore.deleted).toBeCalledWith(2);

    // Subtest: 404 when image does not exist
    app.context.imageStore = {
      exists: jest.fn().mockReturnValueOnce(Promise.resolve(false)),
      deleted: jest.fn().mockReturnValueOnce(Promise.resolve(false))
    };

    await request(server)
      .delete('/api/image/2')
      .proto(imagery.Image)
      .expect(404);

    expect(app.context.imageStore.exists).toBeCalledWith(2);

    // Subtest: 410 when image was deleted
    app.context.imageStore = {
      exists: jest.fn().mockReturnValueOnce(Promise.resolve(true)),
      deleted: jest.fn().mockReturnValueOnce(Promise.resolve(true))
    };

    await request(server)
      .delete('/api/image/2')
      .proto(imagery.Image)
      .expect(410);

    expect(app.context.imageStore.exists).toBeCalledWith(2);
    expect(app.context.imageStore.deleted).toBeCalledWith(2);
  } finally {
    await new Promise(resolve => server.close(() => resolve()));
  }
});
