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

  /** Get a session on the camera and configure the camera. */
  async acquire() {
    await this._makeReq('/ctrl/session');

    // Set the date
    const datetime = new Date();
    const time  = datetime.toTimeString().split(' ')[0];
    const year  = `${datetime.getFullYear()}`.padStart(4, '0'); // no left-pad
    const month = `${datetime.getMonth()}`.padStart(2, '0');
    const day   = `${datetime.getDate()}`.padStart(2, '0');
    const date  = `${year}-${month}-${day}`;
    await this._setParam(`/datetime?date=${date}&time=${datetime}`);

    await this._makeReq('/ctrl/mode?action=to_cap'); // Put us in capture mode
    await this._setParam('drive_mode', 'single');  // Single shot drive mode
    await this._setParam('photosize', '16M');      // 16M
    await this._setParam('wb', 'Auto');            // Auto WB (White Balance)
    await this._setParam('iso', 'Auto');           // Auto ISO
    await this._setParam('sharpness', 'Normal');   // Normal Sharpness
    await this._setParam('contrast', '64');        // 64/256 for Contrast
    await this._setParam('saturation', '64');      // 64/256 for Saturation
    await this._setParam('brightness', '0');       // Brightness: 0 [-256, 256]
    await this._setParam('meter_mode', 'Average'); // Average for Meter Mode
    await this._setParam('ev', '0');               // EV: 0 (to start) [-96, 96]
    await this._setParam('lcd', 'Off')             // LCD off (save some power)
    await this._setParam('rotation', 'Normal')     // We're not upside down!
    await this._setParam('focus', 'AF')            // Enable Autofocus
    await this._setParam('af_mode', 'Normal')      // Normal Autofocus mode
    await this._setParam('photo_q', 'S.Fine');     // Photo Quality
    await this._setParam('led', 'On');             // LEDs on!
    await this._setParam('max_exp', 'Auto');       // Auto Exposure Time
    await this._setParam('shutter_angle', 'Auto'); // Shouldn't matter
    // Skipping "mwb"; this should have an invalid negative value when queried.
    await this._setParam('shutter_spd', 'Auto');   // Auto Shutter Speed
    await this._setParam('caf_range', 'Auto');     // Auto Continuous AF Range
    await this._setParam('caf_sens', 'Middle');    // Middle CAF Sensitivity
    await this._setParam('lut', 'sRGB');           // sRGB lookup
    await this._setParam('dewarp', 'On');          // Distortion Correction: On
    await this._setParam('vignette', 'Off');       // Vignette Correction: Off
    await this._setParam('noise_reduction', 'NormalNoise');
    await this._setParam('lcd_backlight', '25');   // Dim the screen
    await this._setParam('oled', 'Off');           // Turn off the OLED Screen
    await this._setParam('shoot_mode', 'Program AE');
    await this._setParam('liveview_audio', 'On');
    await this._setParam('max_iso', '6400');       // Max ISO to absolute max
    await this._setParam('auto_off', '0');         // Disable auto-off
    await this._setParam('auto_off_lcd', '30');    // 30s LCD timeout
    await this._setParam('caf', '1');              // Continuous AF: On
    await this._setParam('grid_display', '0');     // No grids!
    await this._setParam('level_correction', '0'); // Level Correction: Off

    // Query:
    //  - the battery level
    //  - the temperature
    //  - number of remaining shots
    //  - aperture (iris)
    //  - last file name
    //  - camera rot
    //  - file number
    // and say something.
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
    await this._makeReq(`/ctrl/set?${param}=${value}`)
  }
}
