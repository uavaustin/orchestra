import path from 'path';

import fileType from 'file-type';
import fs from 'fs-extra';
import nock from 'nock';

import logger from '../../src/common/logger';
import { telemetry } from '../../src/messages';

import ZCamE1Backend from '../../src/backends/z-cam-e1-backend';
import { wait } from '../../src/util';

afterEach(async () => {
  jest.clearAllMocks();
});

test('capture images with telemetry when available', async () => {
  const imageFilename = path.join(__dirname, '../fixtures/shape-1.jpg');
  const image = await fs.readFile(imageFilename, { encoding: null });

  const imageStore = {
    addImage: jest.fn().mockImplementation(() => Promise.resolve())
  };

  const t1 = telemetry.CameraTelem.encode({ time: 1, lat: 2 }).finish();

  const cameraApi = nock('http://camera:1234')
    .get('/ctrl/session')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/mode?action=to_cap')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/af')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/still?action=single')
    .reply(200, JSON.stringify({
      code: 0, desc: '', msg: '/DCIM/100MEDIA/EYED6391.JPG'
    }))
    .get('/DCIM/100MEDIA/EYED6391.JPG')
    .reply(200, image, { 'content-type': 'image/jpeg' })
    .get('/DCIM/100MEDIA/EYED6391.JPG?act=rm')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/af')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/still?action=single')
    .reply(200, JSON.stringify({
      code: 0, desc: '', msg: '/DCIM/100MEDIA/EYED6392.JPG'
    }))
    .get('/DCIM/100MEDIA/EYED6392.JPG')
    .reply(200, image, JSON.stringify({ 'content-type': 'image/jpeg' }))
    .get('/DCIM/100MEDIA/EYED6392.JPG?act=rm')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/session?action=quit')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }));

  const telemApi = nock('http://telemetry:8081')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/camera-telem').reply(200, t1)
    .get('/api/camera-telem').reply(500);

  const backend = new ZCamE1Backend(
    imageStore, 500, 'http://camera:1234', 'http://telemetry:8081'
  );

  // Skip the extra configuration for the tests.
  backend.performExtendedConfiguration = false;

  const spy = jest.spyOn(logger, 'error');

  await backend.start();
  await wait(250);

  try {
    expect(spy).not.toHaveBeenCalled();

    logger.transports[0].silent = true;
    await wait(500);
  } finally {
    logger.transports[0].silent = false;
    await backend.stop();
  }

  cameraApi.done();
  telemApi.done();

  expect(imageStore.addImage).toBeCalledTimes(2);

  expect(fileType(imageStore.addImage.mock.calls[0][0]).ext).toEqual('jpg');
  expect(imageStore.addImage.mock.calls[0][1].time).toBeDefined();
  expect(imageStore.addImage.mock.calls[0][1].has_telem).toBeTruthy();
  expect(imageStore.addImage.mock.calls[0][1].telem.lat).toEqual(2);
  expect(fileType(imageStore.addImage.mock.calls[1][0]).ext).toEqual('jpg');
  expect(imageStore.addImage.mock.calls[1][1].time).toBeDefined();
  expect(imageStore.addImage.mock.calls[1][1].has_telem).toBeFalsy();

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy.mock.calls[0][0]).toMatch(/Error while requesting telemetry/);
});

test('backend continues after errors', async () => {
  const cameraApi = nock('http://camera:1234')
    .get('/ctrl/session')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/mode?action=to_cap')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/af')                             // Attempt 1
    .reply(500)
    .get('/ctrl/af')                             // Attempt 2
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/still?action=single')
    .reply(500)
    .get('/ctrl/af')                             // Attempt 3
    .reply(200, JSON.stringify({ code: 1, desc: '', msg: '' }))
    .get('/ctrl/af')                             // Attempt 4
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/still?action=single')
    .reply(200, JSON.stringify({ code: 1, desc: '', msg: '' }))
    .get('/ctrl/af')                             // Attempt 5
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }))
    .get('/ctrl/still?action=single')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '/empty-image' }))
    .get('/empty-image')
    .reply(200, '', { 'content-type': 'image/jpeg' })
    .get('/ctrl/session?action=quit')
    .reply(200, JSON.stringify({ code: 0, desc: '', msg: '' }));

  const backend = new ZCamE1Backend(
    {}, 500, 'http://camera:1234'
  );

  // Again, skip the extra configuration.
  backend.performExtendedConfiguration = false;

  logger.transports[0].silent = true;

  await backend.start();

  // Check error conditions of 500 status code, a bad code in the
  // JSON, and an empty image, so it should error out five times
  // after 1000 ms. There should be some lag to prevent errors from
  // repeating quickly (this prevents a device from being overloaded
  // with requests).
  const spy = jest.spyOn(logger, 'error');

  await wait(5);
  expect(spy).toHaveBeenCalledTimes(1);

  await wait(240);
  expect(spy).toHaveBeenCalledTimes(1);

  await wait(10);
  expect(spy).toHaveBeenCalledTimes(2);

  await wait(240);
  expect(spy).toHaveBeenCalledTimes(2);

  await wait(10);
  expect(spy).toHaveBeenCalledTimes(3);

  await wait(240);
  expect(spy).toHaveBeenCalledTimes(3);

  await wait(10);
  expect(spy).toHaveBeenCalledTimes(4);

  await wait(240);
  expect(spy).toHaveBeenCalledTimes(4);

  await wait(25);
  expect(spy).toHaveBeenCalledTimes(5);

  await backend.stop();

  logger.transports[0].silent = false;

  cameraApi.done();
});
