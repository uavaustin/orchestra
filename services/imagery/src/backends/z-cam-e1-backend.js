import request from 'superagent';

import CameraBaseBackend from './camera-base-backend';

export default class ZCamE1Backend extends CameraBaseBackend {
  /**
   * Camera backend for the Z Cam E1.
   *
   * See Z Cam E1 documentation for explanation of requests:
   *   https://github.com/imaginevision/Z-Camera-Doc/blob/master/E1/
   */

  constructor(imageStore, interval, cameraUrl, telemetryUrl) {
    super(imageStore, interval, telemetryUrl);
    this._cameraUrl = cameraUrl;
  }

  /** Get a session on the camera. */
  async acquire() {
    await this._makeReq('/ctrl/session');
  }

  /** Capture an image, download it, and remove it. */
  async capture() {
    const filename = (await this._makeReq('/ctrl/still?action=single')).msg;
    const photo = await this._makeReq(filename, true);
    await this._makeReq(filename + '?act=rm');

    return photo;
  }

  /** Quit the session on the camera. */
  async release() {
    await this._makeReq('/ctrl/session?action=quit');
  }

  async _makeReq(endpoint, image = false) {
    const res = await request.get(this._cameraUrl + endpoint)
      .buffer()
      .timeout(5000);

    // Each request comes with a code if it failed (except images).
    if (image) {
      return res.body;
    } else {
      // We can't rely on the content type being set to
      // `application/json` for the Z Cam E1.
      const body = JSON.parse(res.text);

      if (body.code !== 0) {
        throw new Error(`code ${body.code} from z-cam-e1 for ${endpoint}`);
      } else {
        return body;
      }
    }
  }
}
