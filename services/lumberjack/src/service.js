import request from 'superagent';
import { InfluxDB, FieldType } from 'influx';
import addProtobuf from 'superagent-protobuf';
import Koa from 'koa';
import koaLogger from './common/koa-logger';
import router from './router';

import { stats } from './messages';
import { telemetry } from './messages';
import { createTimeoutTask } from './common/task';
import logger from './common/logger';

addProtobuf(request);

export default class Service {
  /**
   * Create a new logging service.
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
    this._port = options.port;
    this._server = null;
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
    this._dbName = options.dbName;
    this._influx = null;
    this._lastGroundData = {};
    this._lastPlaneData = {};
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
            devicePing: FieldType.INTEGER,
            apiStatus: FieldType.INTEGER,
            deviceStatus: FieldType.INTEGER
          },
          tags: [ 'host', 'port', 'name' ]
        },
        {
          measurement: 'upload-rate',
          fields: {
            total_1: FieldType.INTEGER,
            total_5: FieldType.INTEGER,
            fresh_1: FieldType.INTEGER,
            fresh_5: FieldType.INTEGER
          },
          tags: [ 'host', 'port' ]
        },
        {
          measurement: 'telemetry',
          fields: {
            gstatus: FieldType.INTEGER,
            pstatus: FieldType.INTEGER
          },
          tags: [ 'host', 'port' ]
        }
      ]
    });

    // Create database if it doesn't exist
    const names = await this._influx.getDatabaseNames();
    if (!names.includes(this._dbName))
      await this._influx.createDatabase(this._dbName);

    this._server = await this._createApi(this);

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

    await this._server.closeAsync();
    this._server = null;

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
      createTimeoutTask(this._telemetry.bind(this, 'gstatus'),
        this._telemInterval)
        .on('error', logger.error)
        .start();
    this._planeTelemetryTask =
      createTimeoutTask(this._telemetry.bind(this, 'pstatus'),
        this._telemInterval)
        .on('error', logger.error)
        .start();
  }

  /** Get service ping data and write to the database */
  async _ping() {
    // Get ping data. If it fails, it will be gracefully be caught
    // and logged.
    let ping;
    try {
      ping = (await request.get('http://' + this._pingHost + ':' +
      this._pingPort + '/api/ping')
        .proto(stats.PingTimes)
        .timeout(1000)).body;
    } catch (err) {
      logger.error(err);
    }

    // Write data for services
    for (let endpoint of ping.service_pings) {
      const { host, port, name } = endpoint;
      await this._influx.writeMeasurement('ping', [
        {
          fields: { apiPing: endpoint.ms, apiStatus: endpoint.online ? 1 : 0 },
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
          fields: { devicePing: endpoint.ms,
            deviceStatus: endpoint.online ? 1 : 0 },
          tags: { host, port, name }
        }], {
        database: this._dbName
      });
    }
  }

  /** Get telemetry upload rate data and write to the database */
  async _uploadRate() {
    const host = this._forwardInteropHost;
    const port = this._forwardInteropPort;

    // Get upload rate
    let { total_1, total_5, fresh_1, fresh_5 } =
      stats.InteropUploadRate.create({});
    try {
      ({ total_1, total_5, fresh_1, fresh_5 } =
        (await request.get(`http://${host}:${port}/api/upload-rate`)
          .proto(stats.InteropUploadRate)
          .timeout(1000)).body);
    } catch (err) {
      // Log the error, but still write the measurement.
      logger.error(err);
    }

    await this._influx.writeMeasurement('upload-rate', [
      {
        fields: { total_1, total_5, fresh_1, fresh_5 },
        tags: { host, port }
      }], {
      database: this._dbName
    });
  }

  /**
   * Get ground or plane telemetry overview and write to the
   * database.
   *
   * @param {String} type the InfluxDB field to write to.
   * Must be `gstatus` or `pstatus`.
   */
  async _telemetry(type) {
    const types = {
      gstatus: {
        host: this._groundTelemetryHost,
        port: this._groundTelemetryPort,
        lastData: this._lastGroundData
      },
      pstatus: {
        host: this._planeTelemetryHost,
        port: this._planeTelemetryPort,
        lastData: this._lastPlaneData
      }
    };

    let { host, port, lastData } = types[type];
    let online = false;

    // Get telemetry overview
    let telemData;

    if (host) {
      try {
        telemData =
          (await request.get(`http://${host}:${port}/api/overview`)
            .proto(telemetry.Overview)
            .timeout(1000)).body;

        // Check if current time is the same or less than the
        // previous timestate.
        if (lastData && telemData.time <= lastData.time) {
          online = false;
        } else {
          online = true;
          // Assign to lastData's reference and not its value so that
          // the respective field in `this` gets updated as well.
          Object.assign(lastData, telemData);
        }
      } catch (err) {
        online = false;
      }
    }

    online = Number(online);
    await this._influx.writeMeasurement('telemetry', [
      {
        fields: { [type]: online ? 1 : 0 },
        tags: { host: host || 'N/A', port: port || 'N/A' }
      }], {
      database: this._dbName
    });
  }

  // Create the koa api and return the http server.
  async _createApi(service) {
    let app = new Koa();

    // Make service available to the routes.
    app.context.service = service;

    app.use(koaLogger());

    // Set up the router middleware.
    app.use(router.routes());
    app.use(router.allowedMethods());

    // Start and wait until the server is up and then return it.
    return await new Promise((resolve, reject) => {
      let server = app.listen(this._port, (err) => {
        if (err) reject(err);
        else resolve(server);
      });

      // Add a promisified close method to the server.
      server.closeAsync = () => new Promise((resolve) => {
        server.close(() => resolve());
      });
    });
  }

  async clearData() {
    // doesn't include ping because no data was written to that measurement
    this._influx.getMeasurements('lumberjack')
      .then(names => {
        for(let i = 0; i < names.length; i++) {
          this._influx.dropMeasurement(names[i])
            .catch((err) => {
              logger.error(err);
            });
        }
      });

    this._influx.getMeasurements()
      .then(names => {
        if (!names.includes('ping', 'upload-rate', 'telemetry')) {
          return true;
        }
      })
      .catch((err) => {
        logger.error(err);
      });
  }
}
