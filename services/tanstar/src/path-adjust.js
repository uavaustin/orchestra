// Manages path adjustment at highest level using Pathfinder

import pf from './backend';

/*
1. Take in routed data for starting PF

2. Have different run cycles for causes of PF call
2.1 Master run (everything new)
2.2 VA run (VA triggers PF)
2.3 New WP run (keep fz/obs same)
2.4 Updated field (new fz/obs, WPs)

3. Channel PF from backend (WASM)
*/

export default class PathAdjust {

  /** Create a new PathAdjust */
  constructor() {
    this._flyzone = null;
    this._obstacles = null;
    this._plane = null;

    this._rawPath = null;
    this._adjustedPath = null;
  }

  async set(flyzones, obstacles, plane, raw_path) {
    this._flyzone = flyzones;
    this._obstacles = obstacles;
    this._plane = plane;
    this._rawPath = raw_path;

    pf.setField(this._flyzones, this._obstacles);
    pf.setPlane(this._plane);
    pf.setRawPath(this._pawPath);
  }

  /** Sets the flyzone and obstacles */
  //async setField() {
  //  await Pathfinder.setField(this._flyzone, this._obstacles);
  //}

  /** Sets the raw path */
  //async setRaw() {
  //  await Pathfinder.setRawPath(this._path);
  //}

  /** Get the pathfinder adjusted path */
  async getAdjusted() {

    const adjusted_path = pf.getAdjustedPath(); // refer to pathfinder.js
    return adjusted_path;
  }

  async pathfind() {
    this.set()
    this.getAdjusted()
  }
}
