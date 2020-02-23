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

// Need to define Pathfinder location!!!!

import queue from 'async/queue';
import telemetry from './messages';

const{ spawn } = require('child_process');

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

    this._overview = null; // do we need an overview?

    this._flyzoneList = null; // list of locations
    this._obstacleList = null; // list of locations
    this._waypointList = null; // list of locations

    this._planeLocation = null; // location

    this._enemy = null; // (location, velocity)

    this._avoiding = null;

    this._processCurrent = null;

    this._taskQueue.drain = () => {
      this._processCurrent = null;
    };

  }

  // getters
  getWaypoints() {
    return this._waypointList;
  }

  getAvoid() {
    return this.avoiding;
  }

  // setters
  setFlyzone(flyzone) {
    this._flyzoneList = flyzone;
  }

  setObstacles(obstacles) {
    this._obstacle_List = obstacles;
  }

  setWaypoints(waypoints) {
    this._waypointList = waypoints;
  }

  setPlane(planeLocation) {
    this._planeLocation = planeLocation;
  }

  setEnemy(enemyLocation) {
    this._enemy = enemyLocation;
  }

  // utility

  async inputsPF() {
    WPs = this._waypointList
    OBs = this._obstacleList
    FZs = this.flyzoneList

    // NEED: convert to stdin based on PF needs
  }

  async outputsPF(data) {
    // NEED: convert from stdout based on PF outputs [data => augWPs]

    return augWPs
  }


  // spawners
  async spawnRunPathfinder() {
    //

      // solve for inputs
      inputs = inputsPF()

      // NEED: find out how to access right folder and give inputs
      const tanChild = spawn('cargo run --bin',
      [inputs]
      {cwd:"/dir"});

      childTan.stdout.on('data', (data) => {
        // convert data from stdout
        augWPs = outputsPF(data)
        setWaypoints(augWPs)
      });

      childTan.on()
  }

/*
  // runners

  async runPathfinder() {

  }


  // debuggers

  async resetPathfinder() {

  }
*/






















  async _killPathfinder() {
  }

  async _runVehicleAvoid() {
  }

  async _killVehicleAvoid() {
  }

  async _addEnemyWaypoint() {
  }

  async _removeEnemyWaypoint() {
  }

  async _stopNSFW() {
  }

  // requests
}
