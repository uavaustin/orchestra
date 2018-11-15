import path from 'path';

import fileType from 'file-type';
import fs from 'fs-extra';
import gphoto2 from 'gphoto2';
import nock from 'nock';

import logger from '../../src/common/logger';
import { telemetry } from '../../src/messages';

import GPhoto2Backend from '../../src/backends/gphoto2-backend';
import { wait } from '../../src/util';

afterEach(async () => {
  jest.clearAllMocks();
});

test('fail when no cameras are found', async () => {
  const getList = jest.fn().mockImplementationOnce(cb => cb([]));

  gphoto2.GPhoto2 = jest.fn(() => {
    return { list: getList };
  });

  const backend = new GPhoto2Backend({}, 50, 'https://example.com');

  await expect(backend.start()).rejects.toThrow(/no camera found/i);
  expect(getList).toBeCalled();
});

test('fail when more than one camera is found', async () => {
  const getList = jest.fn().mockImplementationOnce(cb => cb([{ }, { }]));

  gphoto2.GPhoto2 = jest.fn(() => {
    return { list: getList };
  });

  const backend = new GPhoto2Backend({}, 50, 'https://example.com');

  await expect(backend.start()).rejects.toThrow(/more than 1 camera found/i);
  expect(getList).toBeCalledTimes(1);
});

test('start backend when one camera is given', async () => {
  const camera = {
    takePicture: jest.fn().mockImplementationOnce((options, cb) => {
      expect(options.download).toBe(true);
      cb(undefined);
    })
  };

  const getList = jest.fn().mockImplementationOnce(cb => cb([camera]));

  gphoto2.GPhoto2 = jest.fn(() => {
    return { list: getList };
  });

  const backend = new GPhoto2Backend({}, 50, undefined);

  logger.transports[0].silent = true;

  await backend.start();
  await backend.stop();

  logger.transports[0].silent = false;

  expect(getList).toBeCalledTimes(1);
  expect(camera.takePicture).toBeCalledTimes(1);
});

test('backend continues after errors', async () => {
  const camera = {
    takePicture: jest.fn().mockImplementation((options, cb) => {
      expect(options.download).toBe(true);
      cb(undefined);
    })
  };

  const getList = jest.fn().mockImplementationOnce(cb => cb([camera]));

  gphoto2.GPhoto2 = jest.fn(() => {
    return { list: getList };
  });

  const backend = new GPhoto2Backend({}, 50, undefined);

  logger.transports[0].silent = true;

  await backend.start();

  // There's an empty image being returned, so it should error out
  // twice after 250 ms. There should be some lag to prevent errors
  // from repeating quickly (this prevents a device from being
  // overloaded with requests).
  const spy = jest.spyOn(logger, 'error');

  await wait(5);
  expect(spy).toHaveBeenCalledTimes(1);

  await wait(240);
  expect(spy).toHaveBeenCalledTimes(1);

  await wait(10);
  expect(spy).toHaveBeenCalledTimes(2);

  await backend.stop();

  logger.transports[0].silent = false;

  expect(getList).toBeCalledTimes(1);
  expect(camera.takePicture).toBeCalledTimes(2);
});

test('photos are taken and added to the image store', async () => {
  // Note that this image has the Exif orientation set to rotated
  // 180 degrees.
  const imageFilename = path.join(__dirname, '../fixtures/shape-2.jpg');
  const image = await fs.readFile(imageFilename, { encoding: null });

  const camera = {
    takePicture: jest.fn().mockImplementationOnce((options, cb) => {
      expect(options.download).toBe(true);
      setImmediate(() => cb(null, image));
    })
  };

  const getList = jest.fn().mockImplementationOnce(cb => cb([camera]));

  gphoto2.GPhoto2 = jest.fn(() => {
    return { list: getList };
  });

  const imageStore = {
    addImage: jest.fn().mockImplementation(() => Promise.resolve())
  };

  const backend = new GPhoto2Backend(imageStore, 500, undefined);
  const spy = jest.spyOn(logger, 'error');

  await backend.start();
  await wait(250);
  await backend.stop();

  expect(getList).toBeCalledTimes(1);
  expect(camera.takePicture).toBeCalledTimes(1);
  expect(imageStore.addImage).toBeCalledTimes(1);

  // We just need to check that this looks like a JPEG file now. It
  // was changed from Exif data modification.
  expect(imageStore.addImage.mock.calls[0][0]).not.toEqual(image);
  expect(fileType(imageStore.addImage.mock.calls[0][0]).ext).toEqual('jpg');
  expect(imageStore.addImage.mock.calls[0][1].time).toBeDefined();

  expect(spy).not.toHaveBeenCalled();
});

test('telemetry is added when available', async () => {
  const imageFilename = path.join(__dirname, '../fixtures/shape-1.jpg');
  const image = await fs.readFile(imageFilename, { encoding: null });

  const camera = {
    takePicture: jest.fn().mockImplementation((options, cb) => {
      expect(options.download).toBe(true);
      setImmediate(() => cb(null, image));
    })
  };

  const getList = jest.fn().mockImplementationOnce(cb => cb([camera]));

  gphoto2.GPhoto2 = jest.fn(() => {
    return { list: getList };
  });

  const imageStore = {
    addImage: jest.fn().mockImplementation(() => Promise.resolve())
  };

  const t1 = telemetry.CameraTelem.encode({ time: 1, lat: 2 }).finish();

  const telemApi = nock('http://telemetry:8081')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/camera-telem').reply(200, t1)
    .get('/api/camera-telem').reply(500);

  const backend = new GPhoto2Backend(imageStore, 500, 'http://telemetry:8081');
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

  telemApi.done();

  expect(getList).toBeCalledTimes(1);
  expect(camera.takePicture).toBeCalledTimes(2);
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
