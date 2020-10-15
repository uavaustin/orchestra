// Manages path adjustment at highest level using Pathfinder

/*
1. Take in routed data for starting PF

2. Have different run cycles for causes of PF call
2.1 Master run (everything new)
2.2 VA run (VA triggers PF)
2.3 New WP run (keep fz/obs same)
2.4 Updated field (new fz/obs, WPs)

3. Have way or running PF (WASM vs FFI vs C-mimic)
*/

export default class PathAdjust {

  /** Create a new PathAdjust */
  constructor() {
    this._flyzone = null;
    this._obstacles = null;

    this._rawPath = null;
    this._adjustedPath = null;
  }

  /** Sets the flyzone and obstacles */
  async setField() {

  }

  /** Sets the raw path */
  async setRaw() {

  }

  /** Get the pathfinder adjusted path */
  async getAdjusted() {

  }


}
