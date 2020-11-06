import request from 'superagent';
import addProtobuf from 'superagent-protobuf';

import logger from '../common/logger';
import { imagery, telemetry } from '../messages';

import { removeOrientation, wait } from '../util';

addProtobuf(request);

export default class CameraBaseBackend {
  /**
   * Base which takes care of taking images on an interval.
   *
   * Takes care of telemetry as well. Requires extension to implement
   * camera capture behavior.
   *
   * Extended classes may implement the acquire() and release(camera)
   * functions, but must implmenent capture(camera).
   */

  /** Create a new camera base backend. */
  constructor(imageStore, interval, telemetryUrl) {
    this._imageStore = imageStore;
    this._interval = interval;
    this._telemetryUrl = telemetryUrl;
    this._active = false;
    this._runningMeta = 0;  // Number of running meta tasks.
    this._endMeta = () => {};  // Used for stop().
  }

  /** Get the camera and then start the loop in the background. */
  async start() {
    this._active = true;

    // Run an acquire function if created on implementor class.
    if (this.acquire) {
      this._camera = await this.acquire();
    } else {
      this._camera = { };
    }

    this._loop = this._runLoop();
  }

  /** Set a flag to kill the camera loop. */
  async stop() {
    this._active = false;

    // Wait until the running loop has finished.
    await this._loop;

    // Wait until all the background tasks have finished.
    await new Promise((resolve) => {
      this._endMeta = () => this._runningMeta === 0 ? resolve() : null;
      this._endMeta();  // In case it's already zero.
    });

    // Run a release function if created on implementor class.
    if (this.release) {
      await this.release();
    }
  }

  /** Continuously take photos. */
  async _runLoop() {
    while (this._active) {
      const startTime = Date.now();

      let photo;
      const metadataPromise = this._getMeta();
      this._runningMeta++;

      try {
        photo = await this._takePhoto(this._camera);
      } catch (err) {
        const message = err.name + ': ' + err.message;
        logger.error('Encountered an error in camera loop: ' + message);

        // Update the count whether successful or not.
        metadataPromise.catch(() => {}).then(() => {
          this._runningMeta--;
          this._endMeta();
        });

        // If we have an error, wait for a little to prevent these
        // errors from happening too rapidly and then continue;
        await wait(250);
        continue;
      }

      // Register the photo in the background (no await). Note that
      // this allows the telemetry to be collected if it takes longer
      // than the photo, and doesn't prevent the next photo from
      // being taken if the telemetry still hasn't been received yet.
      metadataPromise.then((metadata) => {
        return this._imageStore.addImage(photo, metadata);
      }).catch((err) => {
        const message = err.name + ': ' + err.message;
        logger.error('Error while registering photo: ' + message);
      }).then(() => {
        // Update the count.
        this._runningMeta--;
        this._endMeta();
      });

      const endTime = Date.now();

      // If we haven't hit the interval time yet, wait some more
      // time.
      const duration = endTime - startTime;

      if (duration < this._interval) {
        await wait(this._interval - duration);
      }
    }
  }

  /** Get the metadata for the image. */
  async _getMeta() {
    // By default, we'll always list the current time.
    const metadata = imagery.Image.create({
      time: (new Date()).getTime() / 1000
    });

    // If a telemetry service url was given, we'll try requesting the
    // latest camera telemetry. If it works, then we'll add it to the
    // metadata.
    if (this._telemetryUrl) {
      try {
        const telem = await this._getCameraTelem();

        // FIXME: since we don't have gimbal data we'll just have to
        //        assume that the camera is pointed straight down.
        telem.roll = 0;
        telem.pitch = 0;

        metadata.has_telem = true;
        metadata.telem = telem;
      } catch (err) {
        const message = err.name + ': ' + err.message;
        logger.error('Error while requesting telemetry: ' + message);
      }
    }

    return metadata;
  }

  /** Request the latest camera telemetry. */
  async _getCameraTelem() {
    const { body: telem } =
      await request.get(this._telemetryUrl + '/api/camera-telem')
        .proto(telemetry.CameraTelem)
        .timeout(1500);

    return telem;
  }

  /** Take a photo and return the data. */
  async _takePhoto(camera) {
    const photo = await this.capture(camera);

    // Taking off EXIF data to prevent image preview applications
    // from rotating it.
    return await removeOrientation(photo);
  }

  getActive() {
    return this._active;
  }
}
