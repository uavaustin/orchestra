// Manages path adjustment at highest level using Pathfinder

// TODO: spawn pathfinder and vehicle avoidance

import queue from 'async/queue';
import { pathfinder } from './messages';

const execFile = require('child_process').execFile;
const spawn = require('child_process').spawn;

//const fs = require('fs');

const ConnectionState = Object.freeze({
  NOT_CONNECTED: Symbol('not_connected'),
  IDLE:          Symbol('idle'),
  RUNNING:       Symbol('running'),
});

export default class Pather {

  /** Create a new Pather **/
  constructor() {
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

  async execPathfinder() {
    //const pathfinder = execFile('pathfinder', [], (error, stdout, sterr)); // may need path variable

    //const args = [
    //  ""
    //  ""
    //]

    const childPathfinder = execFile('pathfinder', function (err, stdout, stderr) {
      this._adjustedPath = stdout;
      this._errorMessage = (err, stderr);
    });

    var bufIn = Buffer.from([this._flightField, this._plane, this._rawPath]);
    childPathfinder.stdin.write(bufIn);

    // TODO: cargo build pathfinder in docker build
  }

  // TODO: add spawn for streaming data in case too large for dump

  //async ExecLookout() {
  //  lookout.exec();
  //}

  // TODO: create connection mechanics
  connect() {
    // spawn pathfinder
    // spawn VA
  };

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

  /** Get the pathfinder adjusted path */
  async transformPath() {
    // Run cycle:

    // Convert flightField, plane, and rawPath (as Mission proto) protobufs into hexadecimal strings

    // Send the message "[FlightField]\n[Plane]\n[Mission]\n", where the bracketed parts are
    // the individual protos converted into hexadecimal. The brackets and quotations shouldn't
    // be sent and "\n" designates a newline character.

    // Wait for pathfinder-cli to return the adjusted path as a Mission proto in the format
    // "[Mission]\n" (similarly to the sending format above).
    //   Note: pathfinder-cli should close after returning the adjusted path.

    // End run cycle
    

    // run pathfinder
    const pathfind = spawn('cargo run -p pathfind'); // TODO: simplify CL with makefile

    this._raw_path.pipe(pathfind.stdin) // TODO: pipe raw path into pathfind

    pathfind.stdout.on('adjusted_path', (adjusted_path) => {
      console.log(`pathfind stdout:\n${adjusted_path}`);
    });

    return adjusted_path;
  }

}
