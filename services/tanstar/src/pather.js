// Manages path adjustment at highest level using Pathfinder

// TODO: spawn pathfinder and vehicle avoidance

import queue from 'async/queue';
import { pathfinder } from './messages';

const { spawn } = require('child_process');

const ConnectionState = Object.freeze({
  NOT_CONNECTED: Symbol('not_connected'),
  IDLE:          Symbol('idle'),
  RUNNING:       Symbol('running'),
});

export default class Pather {

  /** Create a new PathAdjust **/
  constructor() {
    this._pathfinderState = ConnectionState.NOT_CONNNECTED;
    this._avoidanceSystemState = ConnectionState.NOT_CONNNECTED;
    //pathfind.spawn();
    //avoidanceSys.spawn();

    this._taskQueue = queue(async (asyncTask) => {
      return await asyncTask();
    }, 1);

    this._flightField = pathfinder.FlightField.create({
      flyzones: {},
      obstacles: {},
    });

    this._plane = pathfinder.Plane.create({
      time: 0,
      pos: {},
      alt: {},
    });

    this._rawPath = null;
    this._adjustedPath = null;

  }

  // TODO: create connection mechanics
  connect() {};

  disconnect() {};

  async getStatus() {
    'Pather is alive!'
  }

  async setFlightField(FlightField) {
    this._flyzones = FlightField.flyzones;
    this._obstacles = FlightField.obstacles;
  }

  async setPlane(plane) {
    this._plane = plane;
  }

  async setRawPath(rawPath) {
    this._rawPath = rawPath;
  }

  async getFlightField() {
    return [this._flyzones, this._obstacles];
  }

  async getFlyzones() {
    return (this._flyzones);
  }

  async getObstacles() {
    return (this._obstacles);
  }

  async getPlane() {
    return (this._plane);
  }

  async getRawPath() {
    return (this._rawPath);
  }

  async getAdjusted() {
    return this._adjustedPath
  }

  async spawnPathfind() {
    pathfind.spawn();
  }

  /** Get the pathfinder adjusted path */
  async transformPath() {

    // run pathfinder
    const pathfind = spawn('cargo run -p pathfind'); // TODO: simplify CL with makefile

    this._raw_path.pipe(pathfind.stdin) // TODO: pipe raw path into pathfind

    pathfind.stdout.on('adjusted_path', (adjusted_path) => {
      console.log(`pathfind stdout:\n${adjusted_path}`);
    });

    return adjusted_path;
  }

}
