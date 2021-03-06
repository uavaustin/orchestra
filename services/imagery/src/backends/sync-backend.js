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
    this._task = null;
  }

  /** Start the sync loop in the background. */
  async start() {
    await this._runLoop();
  }

  async stop() {
    if (!this._task)
      throw Error('backend is not running');

    await this._task.stop();
    this._task = null;
  }

  async _runLoop() {
    // The images we've fetched so far.
    // Making it into a set allows constant-time lookup.
    let stored = new Set(await this._imageStore.getAvailable());

    this._task = createTimeoutTask(async () => {
      try {
        // First we'll just see what the latest id number is.
        const remoteAvailable = await this._getAvailable();

        // Filter the available images by the ones that our local
        // store currently doesn't have.
        let missing = remoteAvailable.filter(id => !stored.has(id));

        // Getting the images we don't have.
        // This must be sequential rather than parallel
        // to keep the `next` endpoint's behavior consistent.
        for (const id of missing) {
          logger.debug('Fetching image: ' + id);

          const msg = await this._getImage(id);

          // Getting the image data from the message.
          const image = msg.image;

          // Clearing the image data so only metadata is left.
          msg.image = null;

          // Adding it to the image store.
          await this._imageStore.addImage(image, msg, id);

          stored.add(id);
        }
      } catch (err) {
        const message = err.name + ': ' + err.message;
        logger.error('Encountered an error in sync loop: ' + message);
      }
    }, 250).start();
  }

  /** Get the list of downloadable images from the remote service. */
  async _getAvailable() {
    const { body: msg } =
      await request.get(this._syncUrl + '/api/available')
        .proto(imagery.AvailableImages)
        .timeout(5000);

    return msg.id_list;
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
