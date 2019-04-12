import Koa from 'koa';
import request from 'superagent';
import { InfluxDB, FieldType } from 'influx'; 
import addProtobuf from 'superagent-protobuf';

import { stats } from './messages';
import { telemetry } from './messages';
import { createTimeoutTask } from './common/task';
import koaLogger from './common/koa-logger';
import logger from './common/logger';
import router from './router';

addProtobuf(request);
let gTimes;

export default class Service {
  /**
   * Create a new service.
   * @param {Object}  options
   * @param {string}  pinghost
   * @param {number}  pingport
   * @param {string}  telemhost
   * @param {number}  telemport
   * @param {string}  influxhost
   * @param {number}  influxport
   * @param {???} influx
   */

  constructor(options) {
    this._pingHost = 'pong'; 
    this._pingPort = 7000; 
    this._forwardInteropHost = 'forward-interop'; 
    this._forwardInteropPort = 4000; 
    this._telemetryHost = 'telemetry'; 
    this._telemetryPort = 5000; 
    this._influxHost = 'influx';
    this._influxPort = 8086;
    this._taskTimeout = options.taskTimeout;
    this._queueLimit = -1;
    this._influx = null;
  }

  /** Start the service. */
  async start() {
    logger.debug('Starting service.');

    try {
    this._influx = new InfluxDB({
      host: this._influxHost, 
      port: this._influxPort, 
      database: 'lumberjack',
      schema: [
        {
          measurement: 'ping',
          fields: {
            apiPing: FieldType.INTEGER,
            devicePing: FieldType.INTEGER
          },
          tags: [
            'host',
            'port',
            'name'
          ]
        },
        {
          measurement: 'upload-rate',
          fields: {
            t1: FieldType.INTEGER,
            t5: FieldType.INTEGER,
            f1: FieldType.INTEGER,
            f5: FieldType.INTEGER
          },
          tags: [
            'host',
            'port'
          ]
        },
        {
          measurement: 'telemetry',
          fields: {
            gstatus: FieldType.INTEGER,
            pstatus: FieldType.INTEGER
          },
          tags: [
            'host',
            'port'
          ]
        }
      ]
    });
  } catch (e) {
    console.log(e);
  }

    //create database if it doesn't exist
    this._influx.createDatabase('lumberjack'); 

    this._startTasks();
    this.server = await this._createApi();
    logger.debug('Service started');
  }

  /** Stop the service. */
  async stop() {
    logger.debug('Stopping service.');

    await Promise.all([
      this._server.closeAsync(),
      Promise.all(this._forwardTasks.map(t => t.stop()))
    ]);

    logger.debug('Service stopped.');
  }

  // Create the koa api and return the http server.
  async _createApi() {
    const app = new Koa();

    app.use(koaLogger());

    // Set up the router middleware.
    app.use(router.routes());
    app.use(router.allowedMethods());

    // Start and wait until the server is up and then return it.
    return await new Promise((resolve, reject) => {
      const server = app.listen(6000, (err) => {
        if (err) {
          reject(err);
        }
        else {
          resolve(server);
        }
      });

      server.closeAsync = () => new Promise((resolve) => {
        server.close(() => resolve());
      });
    });
  }

  _startTasks() {
    this._pingTask =
      createTimeoutTask(this._pingTask.bind(this), this._taskTimeout)
        .on('error', logger.error)
        .start();
    this._uploadRateTask = 
      createTimeoutTask(this._uploadRate.bind(this), this._taskTimeout)
        .on('error', logger.error)
        .start();
    this._telemetryTask =
      createTimeoutTask(this._telemetryOverview.bind(this), this._taskTimeout)
        .on('error', logger.error)
        .start();
  }

  // Get service ping data and write it to the database
  async _pingTask() {
    logger.debug('');

    let ping =
      (await request.get('http://' + this._pingHost + ':' +
        this._pingPort + '/api/ping')
        .proto(stats.PingTimes)
        .timeout(1000)).body;

    //write data for services
    for (let endpoint of ping.service_pings) {
      let { host, port, name } = endpoint;
      await this._influx.writeMeasurement('ping', [
        {
          fields: { apiPing: endpoint.ms },
          tags: { host, port, name }
        }], {
        database: 'lumberjack'
      });
    }

    //write data for devices
    for (let endpoint of ping.device_pings) {
      let { host, port, name} = endpoint;
      await this._influx.writeMeasurement('ping', [
        {
          fields: { devicePing: endpoint.ms },
          tags: { host, port, name}
        }], {
          database: 'lumberjack'
      });
    }
  }

  // Get telemetry upload rate data and write it to the database
  async _uploadRate() {
    let rate =
      (await request.get('http://' + this._forwardInteropHost + ':' +
        this._forwardInteropPort + '/api/upload-rate')
        .proto(stats.InteropUploadRate)
        .timeout(1000)).body;

    await this._influx.writeMeasurement('upload-rate', [
      {
        fields: { t1: rate.total_1, t5: rate.total_5,
          f1: rate.fresh_1, f5: rate.fresh_5 },
        tags: { host: this._forwardInteropHost, port: this._forwardInteropPort }
      }]);
  }

  //Get ground telemetry and plane telemetry
  async _telemetryOverview() {
    const OFFLINE = 0;
    const ONLINE = 1;
    let gstatus, pstatus;

    let groundTelem = 
      (await request.get('http://' + this._telemetryHost + ':' + 
        this._telemetryPort + '/api/overview')
        .proto(telemetry.Overview)
        .timeout(1000)).body;

    let queueLength = 
      (await request.get('http://' + this._telemetryHost + ':' + 
        this._telemetryPort + '/api/queue-length')
        .timeout(1000)).body;

    //check if current time is the same as the previous timestate
    if (groundTelem.time == gTimes) {
      gstatus = OFFLINE;
      pstatus = OFFLINE;
    } else {
      gstatus = ONLINE;
      pstatus = ONLINE;
    }
    if (queueLength > this._queueLimit){
      pstatus = OFFLINE;
    } 

    gTimes = groundTelem.time;

    await this._influx.writeMeasurement('telemetry', [
      {
        fields: { gstatus: gstatus, pstatus: pstatus },
        tags: { host: this._telemetryHost, port: this._telemetryPort }
      }]);
  }
}
