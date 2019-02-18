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
    this._pingHost = '10.148.67.123';
    this._pingPort = 7000;
    this._telemHost = '10.148.67.123';
    this._telemPort = 5000; 
    this._influxHost = options.influxHost;
    this._influxPort = options.influxPort;
    this._influx = null;
  }

  /** Start the service. */
  async start() {
    logger.debug('Starting service.');

    this._influx = new Influx.InfluxDB({
    host: '10.148.67.123', //env variable localhost
    port: 8086, //env variable 8086
    database: 'lumberjack',
    schema: [
      {
        measurement: 'ping',
        fields: {
         ping: Influx.FieldType.FLOAT
        },
        tags: [
          'host',
          'port'
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
  })

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
          console.log(err);
        }
        else {
          console.log('lmaoooo');
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
      createTimeoutTask(this._logging.bind(this), 500)
        .on('error', () => {
          console.log('muppet');
        })
        .start();
  }

  // Get telemetry and ping data and send to database
  async _logging() {
    logger.debug('');
    let ping = Math.random()*100+1;

    try {
      let { body: ping } =
        await request.get('http://' + this._pingHost + ':' + this._pingPort + '/api/ping')
          .proto(stats.PingTimes)
          .timeout(1000);
    } catch (err) {
        console.log(err); 
    }
    //console.log(ping);

    try {
      this._influx.writeMeasurement('ping', [
        {
          fields: { ping: ping },
          tags: { host: this._pingHost, port: this._pingPort }
      }], {
        database: 'lumberjack'
      });
    } catch (err) {
      console.log(err);
    }

    try {
    let { body: total_1, fresh_1, total_5, fresh_5 } =
      await request.get('http://' + this._telemHost + ':' + this._telemPort + '/api/upload-rate')
        .proto(stats.InteropUploadRate)
        .timeout(1000);
      } catch (err) {
        console.log(err);
      }
    let total_1 = Math.random()*100+1; 
    let total_5 = Math.random()*100+1;
    let fresh_1 = Math.random()*100+1;
    let fresh_5 = Math.random()*100+1;

    //console.log(total_1);    
    //console.log(total_5);
    //console.log(fresh_1);   
    //console.log(fresh_5);

    try {
      this._influx.writePoints([
        {
          measurement: 'telemetry',
          fields: { t1: total_1, t5: total_5, f1: fresh_1, f5: fresh_5 }, 
          tags: { host: this._telemHost, port: this._telemPort }
        }])
    } catch (err) {
      console.error(err);
    }
  }
}