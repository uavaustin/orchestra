import request from 'superagent';
import { InfluxDB, FieldType } from 'influx';
import addProtobuf from 'superagent-protobuf';

import { stats } from './messages';
import { telemetry } from './messages';
import { createTimeoutTask } from './common/task';
import logger from './common/logger';

addProtobuf(request);

export default class Service {
  /**
   * Create a new service.
   * @param {Object}  options
   * @param {string}  options.pingHost
   * @param {number}  options.pingPort
   * @param {string}  options.forwardInteropHost
   * @param {number}  options.forwardInteropPort
   * @param {string}  options.groundTelemetryHost
   * @param {number}  options.groundTelemetryPort
   * @param {string}  options.planeTelemetryHost
   * @param {number}  options.planeTelemetryPort
   * @param {string}  options.influxHost
   * @param {number}  options.influxPort
   * @param {number}  options.uploadInterval
   * @param {number}  options.queueLimit
   */

  constructor(options) {
    this._pingHost = options.pingHost;
    this._pingPort = options.pingPort;
    this._forwardInteropHost = options.forwardInteropHost;
    this._forwardInteropPort = options.forwardInteropPort;
    this._groundTelemetryHost = options.groundTelemetryHost;
    this._groundTelemetryPort = options.groundTelemetryPort;
    this._planeTelemetryHost = options.planeTelemetryHost;
    this._planeTelemetryPort = options.planeTelemetryPort;
    this._influxHost = options.influxHost;
    this._influxPort = options.influxPort;
    this._uploadInterval = options.uploadInterval;
    this._pingInterval = options.pingInterval;
    this._telemInterval = options.telemInterval;
    this._gTimes = options.gTimes;
    this._dbName = options.dbName;
    this._influx = null;
  }

  /** Start the service. */
  async start() {
    logger.debug('Starting service.');

    /** Database configuration */
    this._influx = new InfluxDB({
      host: this._influxHost,
      port: this._influxPort,
      database: this._dbName,
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
            total_1: FieldType.INTEGER,
            total_5: FieldType.INTEGER,
            fresh_1: FieldType.INTEGER,
            fresh_5: FieldType.INTEGER
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
    // Create database if it doesn't exist
    const names = await this._influx.getDatabaseNames();
    if (!names.includes(this._dbName))
      await this._influx.createDatabase(this._dbName);

    this._startTasks();
    logger.debug('Service started');
  }

  /** Stop the service. */
  async stop() {
    logger.debug('Stopping service.');

    await Promise.all([
      this._pingTask.stop(),
      this._uploadRateTask.stop(),
      this._groundTelemetryTask.stop(),
      this._planeTelemetryTask.stop(),
    ]);

    logger.debug('Service stopped.');
  }

  _startTasks() {
    this._pingTask =
      createTimeoutTask(this._ping.bind(this),
        this._pingInterval)
        .on('error', logger.error)
        .start();
    this._uploadRateTask =
      createTimeoutTask(this._uploadRate.bind(this),
        this._uploadInterval)
        .on('error', logger.error)
        .start();
    this._groundTelemetryTask =
      createTimeoutTask(this._groundTelemetry.bind(this),
        this._telemInterval)
        .on('error', logger.error)
        .start();
    this._planeTelemetryTask =
      createTimeoutTask(this._planeTelemetry.bind(this),
        this._telemInterval)
        .on('error', logger.error)
        .start();
  }

  /** Get service ping data and write to the database */
  async _ping() {
    // Get ping data
    let ping;
    try {
      ping =
        (await request.get('http://' + this._pingHost + ':' +
          this._pingPort + '/api/ping')
          .proto(stats.PingTimes)
          .timeout(1000)).body;
    } catch (err) {
      logger.error(err);
      await this._influx.writeMeasurement('ping', [
        {
          fields: { apiPing: 0 },
          tags: { host: 'non-existent-service', port: 0, name: 'service'}
        }], {
        database: this._dbName
      });
    }

    // Write data for services
    for (let endpoint of ping.service_pings) {
      const { host, port, name } = endpoint;
      await this._influx.writeMeasurement('ping', [
        {
          fields: { apiPing: endpoint.ms },
          tags: { host, port, name }
        }], {
        database: this._dbName
      });
    }

    // Write data for devices
    for (let endpoint of ping.device_pings) {
      const { host, port, name } = endpoint;
      await this._influx.writeMeasurement('ping', [
        {
          fields: { devicePing: endpoint.ms },
          tags: { host, port, name }
        }], {
        database: this._dbName
      });
    }
  }

  /** Get telemetry upload rate data and write to the database */
  async _uploadRate() {
    // Get upload rate
    let rate;
    try {
      rate =
      (await request.get('http://' + this._forwardInteropHost + ':' +
        this._forwardInteropPort + '/api/upload-rate')
        .proto(stats.InteropUploadRate)
        .timeout(1000)).body;
    } catch (err) {
      await this._influx.writeMeasurement('upload-rate', [
        {
          fields: { total_1: 0, total_5: 0, fresh_1: 0, fresh_5: 0},
          tags: { host: 'non-existent-service', port: 0}
        }], {
        database: this._dbName
      });
    }

    await this._influx.writeMeasurement('upload-rate', [
      {
        fields: { total_1: rate.total_1, total_5: rate.total_5,
          fresh_1: rate.fresh_1, fresh_5: rate.fresh_5 },
        tags: { host: this._forwardInteropHost, port: this._forwardInteropPort }
      }], {
      database: this._dbName
    });
  }

  /** Get ground telemetry overview and write to the database */
  async _groundTelemetry() {
    const OFFLINE = 0;
    const ONLINE = 1;
    let gstatus;

    // Get telemetry overview
    let groundTelem;
    try {
      groundTelem =
        (await request.get('http://' + this._groundTelemetryHost + ':' +
          this._groundTelemetryPort + '/api/overview')
          .proto(telemetry.Overview)
          .timeout(1000)).body;
    } catch (err) {
      gstatus = OFFLINE;
    }

    // Check if current time is the same or less than the previous
    // timestate
    if (groundTelem.time <= this._gTimes) {
      gstatus = OFFLINE;
    } else {
      gstatus = ONLINE;
    }

    // Update current time if greater or same from previous time
    // state
    if (groundTelem.time >= this._gTimes)
      this._gTimes = groundTelem.time;

    await this._influx.writeMeasurement('telemetry', [
      {
        fields: { gstatus },
        tags: { host: this._groundTelemetryHost,
          port: this._groundTelemetryPort }
      }], {
      database: this._dbName
    });
  }

  /** Get plane telemetry overview and write to database */
  async _planeTelemetry() {
    const OFFLINE = 0;
    const ONLINE = 1;
    let pstatus;

    // Get telemetry overview
    let planeTelem;
    try {
      planeTelem =
        (await request.get('http://' + this._planeTelemetryHost + ':' +
          this._planeTelemetryPort + '/api/overview')
          .proto(telemetry.Overview)
          .timeout(1000)).body;
    } catch (err) {
      pstatus = OFFLINE;
    }

    // Check if current time is the same or less than the previous
    // timestate
    if (planeTelem.time <= this._gTimes) {
      pstatus = OFFLINE;
    } else {
      pstatus = ONLINE;
    }

    // Update current time if greater or same from previous time
    // state
    if (planeTelem.time >= this._gTimes)
      this._gTimes = planeTelem.time;

    await this._influx.writeMeasurement('telemetry', [
      {
        fields: { pstatus },
        tags: { host: this._planeTelemetryHost,
          port: this._planeTelemetryPort }
      }], {
      database: this._dbName
    });
  }
}
