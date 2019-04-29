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
   * @param {number}  options.port
   * @param {string}  options.pingHost
   * @param {number}  options.pingPort
   * @param {string}  options.forwardInteropHost
   * @param {number}  options.forwardInteropPort
   * @param {string}  options.telemetryHost
   * @param {number}  options.telemetryPort
   * @param {string}  options.influxHost
   * @param {number}  options.influxPort
   * @param {number}  options.uploadInterval
   * @param {number}  options.queueLimit
   * @param {InfluxDB} influx
   */

  constructor(options) {
    this._port = options.port;
    this._pingHost = options.pingHost;
    this._pingPort = options.pingPort;
    this._forwardInteropHost = options.forwardInteropHost;
    this._forwardInteropPort = options.forwardInteropPort;
    this._telemetryHost = options.telemetryHost;
    this._telemetryPort = options.telemetryPort;
    this._influxHost = options.influxHost;
    this._influxPort = options.influxPort;
    this._uploadInterval = options.uploadInterval;
    this._queueLimit = options.queueLimit;
    this._influx = null;
  }

  /** Start the service. */
  async start() {
    logger.debug('Starting service.');

    /** Database configuration */
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
    //Create database
    this._influx.createDatabase('lumberjack');

    this._server = await this._createApi(this._influx);
    this._startTasks();
    logger.debug('Service started');
  }

  /** Stop the service. */
  async stop() {
    logger.debug('Stopping service.');

    await Promise.all([
      this._server.closeAsync(),
      this._pingTask.stop(),
      this._uploadRateTask.stop(),
      this._telemetryTask.stop()
    ]);

    logger.debug('Service stopped.');
  }

  // Create the koa api and return the http server.
  async _createApi(influx) {
    const app = new Koa();

    app.use(koaLogger());

    app.context.influx = influx;

    // Set up the router middleware.
    app.use(router.routes());
    app.use(router.allowedMethods());

    // Start and wait until the server is up and then return it.
    return await new Promise((resolve, reject) => {
      const server = app.listen(this._port, (err) => {
        if (err) reject(err);
        else resolve(server);
      });

      // Add a promisified close method to the server.
      server.closeAsync = () => new Promise((resolve) => {
        server.close(() => resolve());
      });
    });
  }

  _startTasks() {
    this._pingTask =
      createTimeoutTask(this._pingTask.bind(this), this._uploadInterval)
        .on('error', logger.error)
        .start();
    this._uploadRateTask =
      createTimeoutTask(this._uploadRate.bind(this), this._uploadInterval)
        .on('error', logger.error)
        .start();
    this._telemetryTask =
      createTimeoutTask(this._telemetryOverview.bind(this),
        this._uploadInterval)
        .on('error', logger.error)
        .start();
  }

  /** Get service ping data and write to the database */
  async _pingTask() {
    //Get ping data
    let ping =
      (await request.get('http://' + this._pingHost + ':' +
        this._pingPort + '/api/ping')
        .proto(stats.PingTimes)
        .timeout(1000)).body;

    //Write data for services
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

    //Write data for devices
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

  /** Get telemetry upload rate data and write to the database */
  async _uploadRate() {
    //Get upload rate
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

  /** Get telemetry overview and task queue length and
  write to the database */
  async _telemetryOverview() {
    const OFFLINE = 0;
    const ONLINE = 1;
    let gstatus, pstatus;

    //Get telemetry overview
    let groundTelem =
      (await request.get('http://' + this._telemetryHost + ':' +
        this._telemetryPort + '/api/overview')
        .proto(telemetry.Overview)
        .timeout(1000)).body;

    //Get length of task queue for the plane
    let queueLength =
      (await request.get('http://' + this._telemetryHost + ':' +
        this._telemetryPort + '/api/queue-length')
        .timeout(1000)).body;

    //Check if current time is the same or less than the previous
    //timestate
    if (groundTelem.time <= gTimes) {
      gstatus = OFFLINE;
      pstatus = OFFLINE;
    } else {
      gstatus = ONLINE;
      pstatus = ONLINE;
    }
    if (queueLength > this._queueLimit){
      pstatus = OFFLINE;
    }

    //update current time if greater or same from previous time state
    if (groundTelem.time >= gTimes)
      gTimes = groundTelem.time;

    await this._influx.writeMeasurement('telemetry', [
      {
        fields: { gstatus: gstatus, pstatus: pstatus },
        tags: { host: this._telemetryHost, port: this._telemetryPort }
      }]);
  }
}
