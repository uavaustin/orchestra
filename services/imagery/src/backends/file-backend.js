import chokidar from 'chokidar';
import fs from 'fs-extra';

import logger from '../../src/common/logger';
import { imagery } from '../messages';

import { convertPng, removeExif } from '../util';

const WATCH_FOLDER_NAME = '/opt/new-images';

export default class FileBackend {
  /**
   * Simple backend which watches a folder for new images.
   *
   * This backend is mostly useful for testing, as no camera is
   * required for use.
   *
   * Because of a potential time delay between when the image was
   * placed in the folder and when it was seen, telemetry is not
   * retrieved.
   */

  /** Create a new file backend. */
  constructor(imageStore) {
    this._imageStore = imageStore;
  }

  /** Watches a folder and adds new images to the image store. */
  async start() {
    // Creates an empty directory to watch if it doesn't exist.
    await fs.mkdirp(WATCH_FOLDER_NAME);

    this._watcher = chokidar.watch(WATCH_FOLDER_NAME)
      .on('add', async (path) => {
        try {
          await this._handleFile(path);
        } catch (err) {
          const message = err.name + ': ' + err.message;
          logger.error('Encountered an error in file watch loop: ' + message);
        }
      });
  }

  /** Stop watching files. */
  async stop() {
    this._watcher.close();
  }

  async _handleFile(path) {
    // Check if it's a JPEG or PNG image.
    const isJpeg = path.match(/\.jpe?g$/i);
    const isPng = path.match(/\.png$/i);

    // Don't process this if it isn't either of the
    // above.
    if (!(isJpeg || isPng)) return;

    // On each new file, read and then delete it.
    let data = await fs.readFile(path, { encoding: null });
    await fs.unlink(path);

    // If this is a PNG, we'll go ahead and convert it to a JPEG.
    if (isPng) data = await convertPng(data);

    // Taking off EXIF data to prevent image preview applications
    // from rotating it.
    data = await removeExif(data);

    // The only metadata here is the timestamp.
    const metadata = imagery.Image.create({
      time: (new Date()).getTime() / 1000
    });

    // Add it to the image store.
    await this._imageStore.addImage(data, metadata);
  }
}
