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

    // PF proto ins
    this._flyzoneList = null; // list of locations
    this._obstacleList = null; // list of locations
    this._inWaypointList = null; // list of locations
    this._planeLocation = null; // location
    this._pathfinderPromise = null; // bool

    // VA proto ins
    this._enemy = null; // (location, velocity)
    this._avoidPromise = null;

    // outs
    this._outWaypointList = null; // list of locations
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
    this._inWayPointList = waypoints;
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
 TO DO:
1. Use fields to run PF

2. Spawn PF

Repeat for VA
*/

  async runPF() {
    this._requestPF()
  }










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
