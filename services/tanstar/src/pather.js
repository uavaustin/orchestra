// Manages path adjustment at highest level using Pathfinder

// TODO: spawn pathfinder and vehicle avoidance

import queue from 'async/queue';
import { pathfinder } from './messages';

const exec = require('child_process').exec;

const protobuf = require('protobufjs'); // TODO: Use koa instead

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
    this._pathfinderError = null;
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

    console.log(this._rawPath);
    const hexedFields = this.fieldsToHex();

    // Send the message "[FlightField]\n[Plane]\n[Mission]\n", where the bracketed parts are
    // the individual protos converted into hexadecimal. The brackets and quotations shouldn't
    // be sent and "\n" designates a newline character.
    // Wait for pathfinder-cli to return the adjusted path as a Mission proto in the format
    // "[Mission]\n" (similarly to the sending format above).
    //   Note: pathfinder-cli should close after returning the adjusted path.

    const hexedMission = await this.execPathfinder(hexedFields);

    // TODO: Convert output to proto
    this.missionHexToField(hexedMission);

    // End run cycle


    // run pathfinder
    await execPathfinder(inputHex);
  }

  execPathfinder(inputHex) {
    const childPathfinder = exec('pathfinder-cli', function (err, stdout, stderr) {
      this._adjustedPath = stdout;
      this._errorMessage = (err, stderr);
    });

    var bufIn = Buffer.from(inputHex, 'hex');
    childPathfinder.stdin.write(bufIn);
  }

  // Converts protobuf fields into hexadecimal and returns them in an array
  fieldsToHex() {
    // format for PF input here
    const hexed = [
          Buffer.from(pathfinder.FlightField.encode(this._flightField).finish(), 'hex'),
          Buffer.from(pathfinder.Plane.encode(this._plane).finish(), 'hex'),
          Buffer.from(pathfinder.Mission.encode(this._rawPath).finish(), 'hex')
    ];

    return hexed;
  }

  // Convert and return a set of protobufs encoded in hexadecimal into protobufs
  // Expects an array: [FlightField, Plane, Mission].
  missionHexToField(missionHex) {
    // Convert hexadecimal messages into bytes
    const missionBytes = Buffer.from(missionHex, 'latin1');

    // Decode bytes into protobufs
    const mission = pathfinder.Mission.decode(missionBytes);

    this._adjustedPath = mission;
  }
}
