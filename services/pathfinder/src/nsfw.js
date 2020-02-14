/*
TO DO:
- Import Vehicle Avoidance Process
- Import Pathfinder Process

- Run VA constantly
- Run PF with conditionally
-- VA calls
-- New WPs


RULES:
- VA and PF cannot run at the same time
- PF called any time WP changes
- VA runs when PF is not runing
- If VA goes off, calls PF to run again
*/

// Run using neon


import queue from 'async/queue';
import telemetry from './messages';

// NOT SUITED FOR WIND
export default class NSFW {
  /**
  * @param {Object} options
  * @param {string} options.host
  * @param {number} options.port
  *
  */
  // separate params for PF and VA?

  constructor(options) {
    this._mav = new MavLinkSocket(options.host, options.port);
    this._cxnState = ConnectionState.NOT_CONNECTED;

    // allows only one process to run at a time, checks at 1s
    this._taskQueue = queue(async (asycnTask) => {
      return await asyncTask();
    }, 1);

    this._overview = null;// what overview do we make for this?

    this._flyzoneList = null; // list of locations
    this._obstacleList = null; // list of locations
    this._waypointList = null; // list of locations
    this._planeLocation = null; /// location

    this._enemyLocation = null;

    this._taskQueue.drain = () => {
      this._getMissionPromise = null;
    };

  }
// check telem for new WPs
  // update inhouse waypoint list

// start PF process
async _startPathfinder() {
  // start pathfinder process
  var ffi = require('ffi');
  var lib = ffi.Library(path.join)
  // feed waypoint list

}
// stop PF process

// start VA process
// stop VA process


// get adjust path

}
