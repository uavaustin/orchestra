import Koa from 'koa';
import request from 'superagent';
const Influx = require('influx');
import addProtobuf from 'superagent-protobuf';

import { stats } from './messages';
import { createTimeoutTask } from './common/task';
import koaLogger from './common/koa-logger';
import logger from './common/logger';
import router from './router';

addProtobuf(request);

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
   * @param {???} influxDB
   */

  constructor(options) {
    this._pingHost = 'pong';
    this._pingPort = 7000;
    this._forwardInteropHost = 'forward-interop';
    this._forwardInteropPort = 4000;
    this._influxHost = options.influxHost;
    this._influxPort = options.influxPort;
    this._influx = null;
  }

  /** Start the service. */
  async start() {
    logger.debug('Starting service.');

    this._influx = new Influx.InfluxDB({
      host: '10.146.229.103', //env variable
      port: 8086, //env variable 8086
      database: 'lumberjack',
      schema: [
        {
          measurement: 'ping',
          fields: {
            ping: Influx.FieldType.INTEGER
          },
          tags: [
            'host',
            'port',
            'name'
          ]
        },
        {
          measurement: 'telemetry',
          fields: {
            t1: Influx.FieldType.INTEGER,
            t5: Influx.FieldType.INTEGER,
            f1: Influx.FieldType.INTEGER,
            f5: Influx.FieldType.INTEGER
          },
          tags: [
            'host',
            'port'
          ]
        }
      ]
    });

    /*this._influx.getDatabaseNames()
    .then(names => {
      if (!names.includes('lumberjack')) {
        return this._influx.createDatabase('lumberjack');
      }
    })
    .catch(err => {
      logger.debug('Failed to create database');
    })*/
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
    this._forwardTask =
      createTimeoutTask(this._logging.bind(this), 1000)
        .on('error', logger.error)
        .start();
  }

  // Get telemetry and ping data and send to database
  async _logging() {
    logger.debug('');

    let ping =
      (await request.get('http://' + this._pingHost + ':' +
        this._pingPort + '/api/ping')
        .proto(stats.PingTimes)
        .timeout(1000)).body;

    for (let endpoint of ping.api_pings) {
      let { host, port, name } = endpoint;
      this._influx.writeMeasurement('ping', [
        {
          fields: { ping: endpoint.ms },
          tags: { host, port, name }
        }], {
        database: 'lumberjack'
      });
    }

    let rate =
      (await request.get('http://' + this._forwardInteropHost + ':' +
        this._forwardInteropPort + '/api/upload-rate')
        .proto(stats.InteropUploadRate)
        .timeout(1000)).body;

    console.log(rate); //eslint-disable-line

    this._influx.writeMeasurement('telemetry', [
      {
        fields: { t1: rate.total_1, t5: rate.total_5,
          f1: rate.fresh_1, f5: rate.fresh_5 },
        tags: { host: this._forwardInteropHost, port: this._forwardInteropPort }
      }]);
  }
}
