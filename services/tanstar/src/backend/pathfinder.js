// Wrapper node file for PF library functionality

// TODO: Find a better way to reference this stuff
const pf = require('./pkg'); // Pathfinder
const pfWraps = require('./pkg/snippets/pathfinder-c95de41a900aea80/src/wrap/pfwrapper.js'); // Pathfinder wrappers

// DEBUG
// Allows viewing of Rust panics
//pf.init_panic_hook();

module.exports.Pathfinder = class Pathfinder {
  /**
   * Creates an internal pathfinder (Rust).
   *
   * @param {Object} flyzones         - Array of arrays of LocationWrappers for the flyzone vertices.
   * @param {Object} obstacles        - Array of ObstacleWrappers.
   * @param {Object} plane            - As PlaneWrapper.
   * @param {Object} [config=default] - As TConfigWrapper
   */
  constructor(flyzones, obstacles, plane, config = new pfWraps.TConfigWrapper()) {
	var tanstar = pf.Tanstar.untimed();

    this.pathfinder = new pf.PathfinderWrapper(tanstar, config, flyzones, obstacles);
  }

  /**
   * Sets the flyzone and obstacles if any are given.
   *
   * @param {Object} flyzones  - Array of arrays of LocationWrappers for the flyzone vertices.
   * @param {Object} obstacles - Array of ObstacleWrappers.
   */
  setField(flyzones, obstacles) {
    if (flyzones !== undefined)
      this.pathfinder.flyzone = flyzones;
    if (obstacles !== undefined)
      this.pathfinder.obstacles = obstacles;
  }

  /**
   * @param {Object} plane - As PlaneWrapper.
   */
  setPlane(plane) {
    this.pathfinder.plane = plane;
  }

  /**
   * Runs the pathfinder and returns the adjusted path from the given raw path.
   * @param {Object} rawPath - Path to be adjusted as an Array of WaypointWrappers.
   */
  getAdjustedPath(rawPath) {
    return this.pathfinder.getAdjustPath(this.pathfinder.plane, rawPath);
  }
}