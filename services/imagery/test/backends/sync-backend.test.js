import path from 'path';

import fs from 'fs-extra';
import nock from 'nock';

import logger from '../../src/common/logger';
import { imagery } from '../../src/messages';

import SyncBackend from '../../src/backends/sync-backend';
import { wait } from '../../src/util';

test('backend fetches images', async () => {
  const images = [];

  for (let i = 0; i < 3; i++) {
    const filename = path.join(__dirname, `../fixtures/shape-${i}.jpg`);
    const image = await fs.readFile(filename, { encoding: null });
    images.push(image);
  }

  const availImgs = imagery.AvailableImages.encode({
    count: 3, id_list: [0, 1, 2]
  }).finish();

  // Create 3 image messages.
  const msg1 = imagery.Image.encode({
    time: 1, id: 0, image: images[0]
  }).finish();

  const msg2 = imagery.Image.encode({
    time: 2, id: 1, has_telem: true, telem: { lat: 2 }, image: images[1]
  }).finish();

  const msg3 = imagery.Image.encode({
    time: 3, id: 2, image: images[2]
  }).finish();

  // Loading these into the fake imagery service.
  const syncApi = nock('http://other-imagery:8081')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/available').reply(200, availImgs)
    .get('/api/image/0').reply(200, msg1)
    .get('/api/image/1').reply(200, msg2)
    .get('/api/image/2').reply(500)
    .get('/api/available').reply(200, availImgs)
    .get('/api/image/2').reply(200, msg3)
    .get('/api/available').reply(200, availImgs);

  const imageStore = {
    getAvailable: jest.fn().mockImplementation(() => []),
    addImage: jest.fn().mockImplementation(() => Promise.resolve())
  };

  const backend = new SyncBackend(imageStore, 'http://other-imagery:8081');
  const spy = jest.spyOn(logger, 'error');

  logger.transports[0].silent = true;

  // The backend should have time to call the available endpoint one
  // last time for the 2nd iteration (but shouldn't try to pull any
  // images).
  await backend.start();
  await wait(750);
  await backend.stop();

  logger.transports[0].silent = false;

  syncApi.done();

  expect(imageStore.getAvailable).toHaveBeenCalledTimes(1);
  expect(imageStore.addImage).toHaveBeenCalledTimes(3);

  // Image id 2 500s the first time.
  expect(spy).toHaveBeenCalledTimes(1);
});
