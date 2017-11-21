const TIME_LIMIT_1 = 1;
const TIME_LIMIT_5 = 5;

let time = () => (new Date()).getTime() / 1000;

/**
 * Provides lives telemetry uploads rates.
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

        this._last = {};
    }

    /**
     * Feed new telemetry to the monitor.
     *
     * @param {Object} telem
     * @prop  {number} telem.lat
     * @prop  {number} telem.lon
     * @prop  {number} telem.alt_msl
     * @prop  {number} telem.yaw
     */
    addTelem(telem) {
        this._times1.push(time());
        this._times5.push(time());

        // Checking if any updates were made to the telemety.
        if (this._last.lat !== telem.lat || this._last.lon !== telem.lon ||
                this._last.alt_msl !== telem.alt_msl || 
                this._last.yaw !== telem.yaw) {
            this._fresh1.push(true);
            this._fresh5.push(true);

            this._last = JSON.parse(JSON.stringify(telem));
        } else {
            this._fresh1.push(false);
            this._fresh5.push(false);
        }

        this._trimArrays();
    }

    /**
     * @typedef {Object} UploadRate
     * @property {number} total1
     * @property {number} total5
     * @property {number} fresh1
     * @property {number} fresh5
     */

    /**
     * Get the upload rates over the last 1 and 5 seconds.
     *
     * A raw rate and one for only fresh telemetry are given.
     *
     * @returns {UploadRate}
     */
    getUploadRate() {
        this._trimArrays();

        // The total rate is simply the number of times over the 
        // range.
        let total1 = this._times1.length / TIME_LIMIT_1;
        let total5 = this._times5.length / TIME_LIMIT_5;

        // Counting how many are true and dividing by the time for
        // the fresh rate.
        let fresh1 = this._fresh1.reduce((acc, curr) => {
            return curr ? acc + 1 : acc;
        }, 0) / TIME_LIMIT_1;
        let fresh5 = this._fresh5.reduce((acc, curr) => {
            return curr ? acc + 1 : acc;
        }, 0) / TIME_LIMIT_5;

        return { total1, total5, fresh1, fresh5 };
    }

    /**
     * Clip off times outside of the time ranges on the arrays.
     * 
     * @private
     */
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
