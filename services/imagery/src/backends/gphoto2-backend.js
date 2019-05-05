import { promisify } from 'util';

import { GPhoto2 } from 'gphoto2';

import CameraBaseBackend from './camera-base-backend';

export default class GPhoto2Backend extends CameraBaseBackend {
  /** Camera backend for cameras with gphoto2 support. */

  /** Get the camera gphoto2 object. */
  async acquire() {
    const gphoto2 = new GPhoto2();

    return await new Promise((resolve, reject) => {
      gphoto2.list((list) => {
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

  /** Capture an image using gphoto2. */
  async capture(camera) {
    const photo = await promisify(camera.takePicture.bind(camera))({
      download: true
    });

    if (!photo) {
      throw Error('Image is empty');
    }

    return photo;
  }
}
