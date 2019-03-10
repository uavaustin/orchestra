import { promisify } from 'util';

import { GPhoto2 } from 'gphoto2';
import request from 'superagent';
import addProtobuf from 'superagent-protobuf';

import logger from '../common/logger';
import { imagery, telemetry } from '../messages';

import { removeOrientation, wait } from '../util';

addProtobuf(request);

export default class GPhoto2Backend {
  /** Create a new gphoto2 backend. */
  constructor(imageStore, interval, telemetryUrl) {
    this._imageStore = imageStore;
    this._interval = interval;
    this._telemetryUrl = telemetryUrl;
    this._active = false;

    this._gphoto2 = new GPhoto2();
  }

  /** Get the camrea and then start the loop in the background. */
  async start() {
    this._active = true;

    const camera = await this._getCamera();

    this._runLoop(camera);
  }

  /** Set a flag to kill the camera loop. */
  async stop() {
    // FIXME: Since there's not a proper shutdown, this will just
    //        wait the duration of the capture interval for now.
    this._active = false;
    await wait(this._interval);
  }

  /** Continuously take photos. */
  async _runLoop(camera) {
    while (this._active) {
      const startTime = Date.now();

      let photo;
      const metadataPromise = this._getMeta();

      try {
        photo = await this._takePhoto(camera);
      } catch (err) {
        const message = err.name + ': ' + err.message;
        logger.error('Encountered an error in camera loop: ' + message);

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
    const photo = await promisify(camera.takePicture.bind(camera))({
      download: true
    });

    if (!photo) {
      throw Error('Image is empty');
    }

    // Taking off EXIF data to prevent image preview applications
    // from rotating it.
    return await removeOrientation(photo);
  }

  /** Get the camera gphoto2 object. */
  async _getCamera() {
    return await new Promise((resolve, reject) => {
      this._gphoto2.list((list) => {
        if (list.length == 0) {
          reject(Error('No camera found.'));
        } else if (list.length >= 2) {
          reject(Error('More than 1 camera found.'));
        } else {
          resolve(list[0]);
        }
      });
    });
  }
}
