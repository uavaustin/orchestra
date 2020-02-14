/*
TO DO:
- Import Vehicle Avoidance Process
- Import Pathfinder Process

- Run PF with conditionally
-- VA calls
-- New WPs
- Run VA when PF is not running


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

    this._overview = null; // do we need an overview

    this._flyzoneList = null; // list of locations
    this._obstacleList = null; // list of locations
    this._waypointList = null; // list of locations

    this._planeLocation = null; // location
    this._enemyLocation = null; // location

    this._processCurrent = null;

    this._taskQueue.drain = () => {
      this._processCurrent = null;
    };

  }

  // getters eventually

  async _startNSFW() {
    // start child
  }

  async _runPathfinder() {
    // run PF
      // feed WP/FZ/OBS/plane
      // run
      // return WPs
      // update WP list
    }

  async _runVehicleAvoid() {
    // run VA
      // feed WP
      // run
      // return alert (bool)
  }

  async _addEnemyWaypoint() {
    // make enemy location to WPs
  }

  async _removeEnemyWaypoint() {
    // take enemy location off WPs
  }

  async _stopNSFW() {
  // stop child
  }

  // requests
  
}
