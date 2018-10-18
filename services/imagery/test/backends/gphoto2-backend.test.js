import gphoto2 from 'gphoto2';

import logger from '../../src/common/logger';

import GPhoto2Backend from '../../src/backends/gphoto2-backend';
import { wait } from '../../src/util';

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
  // twice after 251 ms. There should be some lag to prevent errors
  // from repeating quickly (this prevents a device from being
  // overloaded with requests).
  const spy = jest.spyOn(logger, 'error');

  await wait(1);
  expect(spy).toHaveBeenCalledTimes(1);

  await wait(248);
  expect(spy).toHaveBeenCalledTimes(1);

  await wait(2);
  expect(spy).toHaveBeenCalledTimes(2);

  await backend.stop();

  logger.transports[0].silent = false;

  expect(getList).toBeCalledTimes(1);
  expect(camera.takePicture).toBeCalledTimes(2);
});
