import Koa from 'koa';
import request from 'superagent';
import Influx from 'influx';

import { stats } from './messages';

export default class Service {
  /**
   * Create a new forward-interop service.
   * @param {Object}  options
   * @param {string}  pinghost
   * @param {number}  pingport
   * @param {string}  telemhost
   * @param {number}  telemport
   * @param {string}  influxhost
   * @param {number}  influxport
   */

  constructor(options) {
    this._pinghost = options.pinghost;
    this._pingport = options.pingport;
    this._telemhost = options.telemhost;
    this._telemport = options.telemport; 
    this._host = options.host;
    this._port = options.port;
  }

  /** Start the service. */
  async start() {
    logger.debug('Starting service.');

    const influx = new Influx.InfluxDB({
    host: _influxhost,
    port: _influxport,
    database: 'lumberjack',
    schema: [
      {
        measurement: 'ping',
        fields: {
         host: Influx.FieldType.STRING,
         port: Influx.FieldType.INTEGER,
         ping: Influx.FieldType.INTEGER
        },
        tags: [
          'name'
        ]
      },
      {
        measurement: 'telemetry',
        fields: {
          host: Influx.FieldType.STRING,
          port: Influx.FieldType.INTEGER,
          t1: Influx.FieldType.INTEGER,
          t5: Influx.FieldType.INTEGER,
          f1: Influx.FieldType.INTEGER,
          f5: Influx.FieldType.INTEGER
        },
        tags: {
          'telem-data'
        }
      }
     ]
    })
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

    app.context.database = database;

    app.use(koaLogger());

    // Set up the router middleware.
    app.use(router.routes());
    app.use(router.allowedMethods());

    // Start and wait until the server is up and then return it.
    return await new Promise((resolve, reject) => {
      const server = app.listen(this._port, (err) => {
        if (err) reject(err);
        else resolve(server);
    });

    server.closeAsync = () => new Promise((resolve) => {
        server.close(() => resolve());
    });

    //Check if database exists and create one if not
    influx.getDatabaseNames()
      .then(names => {
      if (!names.includes('lumberjack')) {
        return influx.createDatabase('lumberjack');
      }
    })
    .catch(err => {
    console.error(`Error creating Influx database`);
    })
    }
  }

  _startTask() {
    this._forwardTask =
      createTimeoutTask(this._pinglogging.bind(this), 2000)
        .on('error', logger.error)
        .start();
  }

  // Get the latest telemetry and send it to the interop server.
  async _pinglogging() {
    logger.debug('Fetching telemetry.');

    let { host, port } =
      await request.get('http://' + s.host + ':' + s.port + '/api/ping')
        .proto(stats.PingTimes.ServicePing)
        .timeout(1000);
    try {
      await influx.writePoints([
        {
          measurement: 'ping',
          fields: { ping: ms },
          tags: {}
      }])
    } catch (err) {
      console.error('rip');
    }

    let { time, total_1, fresh_1, total_5, fresh_5 } =
      await request.get('http://' + s.host + ':' + s.port + '/api/upload-rate')
        .proto(stats.InteropUploadRate)
        .timeout(1000);
    try {
      await influx.writePoints([
        {
          measurement: 'telemetry',
          fields: { t1: total_1, t5: total_5, f1: fresh_1, f5: fresh_5 }, 
          tags: {}
        }])
    } catch (err) {
      console.error('rip');
    }
  }
}