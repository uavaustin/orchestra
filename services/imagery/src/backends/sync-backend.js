import request from 'superagent';
import addProtobuf from 'superagent-protobuf';

import logger from '../common/logger';
import { createTimeoutTask } from '../common/task';
import { imagery } from '../messages';

addProtobuf(request);

export default class SyncBackend {
  /**
   * Backend which pulls data from another imagery service.
   *
   * This is useful for mirroring imagery data on another machine
   * from where the imagery originates from.
   *
   * Telemetry data is simply gathered from the original image.
   */

  /** Create a new sync backend. */
  constructor(imageStore, syncUrl) {
    this._imageStore = imageStore;
    this._syncUrl = syncUrl;
    this._active = false;
  }

  /** Start the sync loop in the background. */
  async start() {
    this._active = true;
    this._runLoop();
  }

  async stop() {
    await this._task.stop();
  }

  async _runLoop() {
    // The last image number we've fetched.
    let lastId = this._imageStore.getCount() - 1;

    this._task = createTimeoutTask(async () => {
      try {
        // First we'll just see what the latest id number is.
        const latestId = await this._getLatestId();

        // Throw an error if the id number went down.
        if (latestId < lastId)
          throw Error('Unexpected latest id number');

        // Getting the images we don't have.
        for (let id = lastId + 1; id <= latestId; id++) {
          logger.debug('Fetching image: ' + id);

          const msg = await this._getImage(id);

          // Getting the image data from the message.
          const image = msg.image;

          // Clearing the image data so only metadata is left.
          msg.image = null;

          // Adding it to the image store.
          await this._imageStore.addImage(image, msg);

          lastId = id;
        }
      } catch (err) {
        const message = err.name + ': ' + err.message;
        logger.error('Encountered an error in sync loop: ' + message);
      }
    }, 250).start();
  }

  /** Get the latest id number the sync url has. */
  async _getLatestId() {
    const { body: msg } =
      await request.get(this._syncUrl + '/api/count')
        .proto(imagery.ImageCount)
        .timeout(5000);

    return msg.count - 1;
  }

  /** Get an image from the sync url by id. */
  async _getImage(id) {
    const { body: image } =
      await request.get(this._syncUrl + '/api/image/' + id)
        .proto(imagery.Image)
        .timeout(5000);

    return image;
  }
}
