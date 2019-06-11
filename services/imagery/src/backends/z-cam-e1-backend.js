import request from 'superagent';

import logger from '../common/logger';

import CameraBaseBackend from './camera-base-backend';

const configuration = [
  ['drive_mode', 'single'],           // Single shot drive mode
  ['photosize', '16M'],               // 16M
  ['wb', 'Auto'],                     // Auto WB (White Balance)
  ['iso', 'Auto'],                    // Auto ISO
  ['sharpness', 'Normal'],            // Normal Sharpness
  ['contrast', '64'],                 // 64/256 for Contrast
  ['saturation', '64'],               // 64/256 for Saturation
  ['brightness', '0'],                // Brightness: 0 [-256, 256]
  ['meter_mode', 'Average'],          // Average for Meter Mode
  ['ev', '0'],                        // EV: 0 (to start) [-96, 96]
  ['lcd', 'Off'],                     // LCD off (save some power)
  ['rotation', 'Normal'],             // We're not upside down!
  ['focus', 'AF'],                    // Enable Autofocus
  ['af_mode', 'Normal'],              // Normal Autofocus mode
  ['photo_q', 'S.Fine'],              // Photo Quality
  ['led', 'On'],                      // LEDs on!
  ['max_exp', 'Auto'],                // Auto Exposure Time
  ['shutter_angle', 'Auto'],          // Shouldn't matter
  // Skipping "mwb"; this should have an invalid value when queried.
  ['shutter_spd', 'Auto'],            // Auto Shutter Speed
  ['caf_range', 'Auto'],              // Auto Continuous AF Range
  ['caf_sens', 'Middle'],             // Middle CAF Sensitivity
  ['lut', 'sRGB'],                    // sRGB lookup
  ['dewarp', 'On'],                   // Distortion Correction: On
  ['vignette', 'Off'],                // Vignette Correction: Off
  ['noise_reduction', 'NormalNoise'], // Default Noise Reduction
  ['lcd_backlight', '25'],            // Dim the screen
  ['oled', 'Off'],                    // Turn off the OLED Screen
  ['shoot_mode', 'Program AE'],       // Auto Mode, roughly.
  ['liveview_audio', 'On'],           // Listen to the wind howling
  ['max_iso', '6400'],                // Max ISO to absolute max
  ['auto_off', '0'],                  // Disable auto-off
  ['auto_off_lcd', '30'],             // 30s LCD timeout
  ['caf', '1'],                       // Continuous AF: On
  ['grid_display', '0'],              // No grids!
  ['level_correction', '0'],          // Level Correction: Off
];

export default class ZCamE1Backend extends CameraBaseBackend {
  /**
   * Camera backend for the Z Cam E1.
   *
   * See Z Cam E1 documentation for explanation of requests:
   *   https://github.com/imaginevision/Z-Camera-Doc/blob/master/E1/
   */

  constructor(imageStore, interval, cameraUrl, telemetryUrl,
    extendedConfig = true) {
    super(imageStore, interval, telemetryUrl);
    this._cameraUrl = cameraUrl;
    this.performExtendedConfiguration = extendedConfig;
  }

  /** Get a session on the camera and configure the camera. */
  async acquire() {
    await this._makeReq('/ctrl/session');

    // Put us in capture mode.
    await this._makeReq('/ctrl/mode?action=to_cap');

    // If we're not fully configuring the camera, we're done here.
    if (this.performExtendedConfiguration === false) return;

    // Set the date (no left-pad).
    const datetime = new Date();
    const time  = datetime.toTimeString().split(' ')[0];
    const year  = `${datetime.getFullYear()}`.padStart(4, '0');
    const month = `${datetime.getMonth()}`.padStart(2, '0');
    const day   = `${datetime.getDate()}`.padStart(2, '0');
    const date  = `${year}-${month}-${day}`;
    await this._setParam(`/datetime?date=${date}&time=${time}`);

    // Load the configuration.
    for (const [key, val] of configuration) {
      await this._setParam(key, val);
    }

    const temperature = await this._makeReq('/ctrl/temperature');
    logger.debug(`Temperature: ${temperature['msg']}`);

    const remaining_shots = await this._makeReq('/ctrl/still?action=remain');
    logger.debug(`Remaining Shots: ${remaining_shots['msg']}`);

    logger.debug(`Battery Level: ${await this._getParam('battery')}`);
    logger.debug(`Aperture: f/${await this._getParam('iris')}`);
    logger.debug(`Last File Name: ${await this._getParam('last_file_name')}`);
    logger.debug(`Camera Rotation: ${await this._getParam('camera_rot')}`);
    logger.debug(`File Number: ${await this._getParam('file_number')}`);

    logger.debug('📷 ready.');
  }

  /** Focus, capture an image, download it, and remove it. */
  async capture() {
    // No explicit focus position; figure out the area automatically.
    await this._makeReq('/ctrl/af');

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

  async _setParam(param, value) {
    await this._makeReq(`/ctrl/set?${param}=${value}`);
  }

  async _getParam(param) {
    const resp = await this._makeReq(`/ctrl/get?k=${param}`);
    return resp['value'];
  }
}
