import { stats } from './messages';

const TIME_LIMIT_1 = 1;
const TIME_LIMIT_5 = 5;

let time = () => Date.now() / 1000;

/**
 * Provides live telemetry uploads rates.
 *
 * Telemetry should be fed into the monitor as it arrvies, to keep
 * the rates as fast as possible.
 *
 * Rates are given over 1 and 5 seconds before the rate is requested
 * and both a raw rate and one for only fresh telemetry are
 * available.
 */
export default class UploadMonitor {
  /**
   * Create a new UploadMonitor.
   */
  constructor() {
    this._times1 = [];
    this._fresh1 = [];

    this._times5 = [];
    this._fresh5 = [];

    this._last = null;
  }

  /**
   * Feed new telemetry to the monitor.
   *
   * @param {Object} telem
   * @param {number} telem.lat
   * @param {number} telem.lon
   * @param {number} telem.alt_msl
   * @param {number} telem.yaw
   */
  addTelem(telem) {
    this._times1.push(time());
    this._times5.push(time());

    // Check if any updates were made to the telemety.
    if (this._isFresh(telem)) {
      this._fresh1.push(true);
      this._fresh5.push(true);

      // Record this telemetry as the new last.
      this._last = JSON.parse(JSON.stringify(telem));
    } else {
      this._fresh1.push(false);
      this._fresh5.push(false);
    }

    this._trimArrays();
  }

  /**
   * Get the upload rates over the last 1 and 5 seconds.
   *
   * A raw rate and one for only fresh telemetry are given.
   *
   * @returns {stats.InteropUploadRate}
   */
  getUploadRate() {
    this._trimArrays();

    // The total rate is simply the number of times over the
    // range.
    let total1 = this._times1.length / TIME_LIMIT_1;
    let total5 = this._times5.length / TIME_LIMIT_5;

    // Count how many are true and divide by the time for the
    // freshrate.
    let fresh1 = this._fresh1.reduce((acc, curr) => {
      return curr ? acc + 1 : acc;
    }, 0) / TIME_LIMIT_1;
    let fresh5 = this._fresh5.reduce((acc, curr) => {
      return curr ? acc + 1 : acc;
    }, 0) / TIME_LIMIT_5;

    return stats.InteropUploadRate.create({
      time: time(),
      total_1: total1,
      fresh_1: fresh1,
      total_5: total5,
      fresh_5: fresh5
    });
  }

  // Return whether this telemetry is different from the last.
  _isFresh(telem) {
    if (this._last === null)
      return true;

    return this._last.lat !== telem.lat || this._last.lon !== telem.lon ||
        this._last.alt_msl !== telem.alt_msl || this._last.yaw !== telem.yaw;
  }

  // Clip off times outside of the time ranges on the arrays.
  _trimArrays() {
    let curr = time();
    let threshold1 = curr - TIME_LIMIT_1;
    let threshold5 = curr - TIME_LIMIT_5;

    // Removing old times until there are none for 1 sec.
    while (this._times1[0] < threshold1) {
      this._times1.shift();
      this._fresh1.shift();
    }

    // Removing old times until there are none for 5 sec.
    while (this._times5[0] < threshold5) {
      this._times5.shift();
      this._fresh5.shift();
    }
  }
}
