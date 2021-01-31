import path from 'path';

import fileType from 'file-type';
import fs from 'fs-extra';

import logger from '../../src/common/logger';

import FileBackend from '../../src/backends/file-backend';
import { wait } from '../../src/util';

const WATCH_FOLDER_NAME = '/opt/new-images';

// Test cleanup.
afterEach(async () => {
  await fs.emptyDir(WATCH_FOLDER_NAME);
  jest.clearAllMocks();
});

test('picks up new JPEGs', async () => {
  const imageStore = {
    addImage: jest.fn().mockImplementationOnce(() => Promise.resolve())
  };

  const backend = new FileBackend(imageStore);
  const spy = jest.spyOn(logger, 'error');

  await backend.start();

  // Note that we copy the file and then move it to ensure that
  // chokidar picks up the file after it's done being written to.
  const source = path.join(__dirname, '../fixtures/shape-0.jpg');
  const tmp = path.join('/tmp', 'test.jpg');
  const dest = path.join(WATCH_FOLDER_NAME, 'test-0.jpg');

  try {
    await fs.copy(source, tmp);
    await fs.rename(tmp, dest);

    // The chokidar watching doesn't need to work instantaneously.
    await wait(250);
  } finally {
    await backend.stop();
  }

  expect(imageStore.addImage).toHaveBeenCalledTimes(1);

  // We just need to check that this looks like a JPEG file now. It
  // was changed from EXIF data modification.
  expect(fileType(imageStore.addImage.mock.calls[0][0]).ext).toEqual('jpg');
  expect(imageStore.addImage.mock.calls[0][1].time).toBeDefined();

  expect(spy).not.toHaveBeenCalled();
});

test('picks up new PNGs and converts them', async () => {
  const imageStore = {
    addImage: jest.fn().mockImplementationOnce(() => Promise.resolve())
  };

  const backend = new FileBackend(imageStore);
  const spy = jest.spyOn(logger, 'error');

  await backend.start();

  const source = path.join(__dirname, '../fixtures/shape-3.png');
  const tmp = path.join('/tmp', 'test.png');
  const dest = path.join(WATCH_FOLDER_NAME, 'test-3.png');

  try {
    await fs.copy(source, tmp);
    await fs.rename(tmp, dest);

    await wait(250);
  } finally {
    await backend.stop();
  }

  expect(imageStore.addImage).toHaveBeenCalledTimes(1);

  // We just need to check that this looks like a JPEG file now. It
  // was changed from the conversion.
  expect(fileType(imageStore.addImage.mock.calls[0][0]).ext).toEqual('jpg');
  expect(imageStore.addImage.mock.calls[0][1].time).toBeDefined();

  expect(spy).not.toHaveBeenCalled();
});

test('ignores other files', async () => {
  const imageStore = {
    addImage: jest.fn().mockImplementationOnce(() => Promise.resolve())
  };

  const backend = new FileBackend(imageStore);
  const spy = jest.spyOn(logger, 'error');

  await backend.start();

  const dest = path.join(WATCH_FOLDER_NAME, 'test.txt');

  try {
    await fs.writeFile(dest, 'this is definitely not an image');

    await wait(250);
  } finally {
    await backend.stop();
  }

  // The file shouldn't have been removed.
  expect(fs.exists(dest)).resolves.toBeTruthy();
  expect(imageStore.addImage).not.toHaveBeenCalled();

  expect(spy).not.toHaveBeenCalled();
});

test('picks up existing images', async () => {
  const imageStore = {
    addImage: jest.fn().mockImplementationOnce(() => Promise.resolve())
  };

  const backend = new FileBackend(imageStore);
  const spy = jest.spyOn(logger, 'error');

  // Note that we copy the file and then move it to ensure that
  // chokidar picks up the file after it's done being written to.
  const source = path.join(__dirname, '../fixtures/shape-0.jpg');
  const tmp = path.join('/tmp', 'test.jpg');
  const dest = path.join(WATCH_FOLDER_NAME, 'test-0.jpg');

  await fs.copy(source, tmp);
  await fs.rename(tmp, dest);

  await backend.start();

  try {
    // The chokidar watching doesn't need to work instantaneously.
    await wait(250);
  } finally {
    await backend.stop();
  }

  expect(imageStore.addImage).toHaveBeenCalledTimes(1);

  // We just need to check that this looks like a JPEG file now. It
  // was changed from EXIF data modification.
  expect(fileType(imageStore.addImage.mock.calls[0][0]).ext).toEqual('jpg');
  expect(imageStore.addImage.mock.calls[0][1].time).toBeDefined();

  expect(spy).not.toHaveBeenCalled();
});

test('keeps going after failures', async () => {
  const imageStore = {
    addImage: jest.fn().mockImplementationOnce(() => Promise.resolve())
  };

  const backend = new FileBackend(imageStore);
  const spy = jest.spyOn(logger, 'error');

  await backend.start();

  const badImage = path.join(WATCH_FOLDER_NAME, 'bad-image.png');

  // Note that we copy the file and then move it to ensure that
  // chokidar picks up the file after it's done being written to.
  const source = path.join(__dirname, '../fixtures/shape-0.jpg');
  const tmp = path.join('/tmp', 'test.jpg');
  const dest = path.join(WATCH_FOLDER_NAME, 'test-0.jpg');

  try {
    logger.transports[0].silent = true;

    await fs.writeFile(badImage, 'this is definitely not an image');

    // The chokidar watching doesn't need to work instantaneously.
    await wait(250);

    logger.transports[0].silent = false;

    // The file should have been removed even though it errored.
    expect(spy).toHaveBeenCalledTimes(1);
    expect(fs.exists(badImage)).resolves.toBeFalsy();
    expect(imageStore.addImage).not.toHaveBeenCalled();

    await fs.copy(source, tmp);
    await fs.rename(tmp, dest);

    await wait(250);
  } finally {
    logger.transports[0].silent = false;

    await backend.stop();
  }

  expect(imageStore.addImage).toHaveBeenCalledTimes(1);

  // We just need to check that this looks like a JPEG file now. It
  // was changed from EXIF data modification.
  expect(fileType(imageStore.addImage.mock.calls[0][0]).ext).toEqual('jpg');
  expect(imageStore.addImage.mock.calls[0][1].time).toBeDefined();

  expect(spy).toHaveBeenCalledTimes(1);
});
