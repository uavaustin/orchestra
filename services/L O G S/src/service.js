import Koa from 'koa';
import request from 'superagent';
import Influx from 'influx';

export default class Service {
  /**
   * Create a new forward-interop service.
   * @param {Object}   options
   * @param {number}   options.port
   * @param {string}   options.name
   * @param {string}   options.host
   * @param {number}   options.port
   * @param {number}   options.t1
   * @param {number}   options.t5
   * @param {number}   options.f1
   * @param {number}   options.f5
   */

  constructor(options) {      
    this._name = options.name;
    this._host = options.host;
    this._port = options.port;
    this._ping = 0;

    this._t1 = options.t1; //consolidate all telemetry into an object??
    this._t5 = options.t5;
    this._f1 = options.f1;
    this._f5 = options.f5;
  }

  /** Start the service. */
  async start() {
    logger.debug('Starting service.');

    const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'sojuwu',
    schema: [
      {
        measurement: 'Ping',
        fields: {
         name: Influx.FieldType.STRING,
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
      //Promise.all(this._serviceTasks.map(t => t.stop())),
      //Promise.all(this._deviceTasks.map(t => t.stop()))
    ]);

    logger.debug('Service stopped.');
  }

  // Create the koa api and return the http server.
  async _createApi() {
    const app = new Koa();

    //app.context.pingStore = pingStore; 

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
      if (!names.includes('sojuwu')) {
        return influx.createDatabase('sojuwu');
      }
    })
    .catch(err => {
    console.error(`Error creating Influx database`);
    })
    }
  }

  _startTask() {
    this._forwardTask =
      createTimeoutTask(this._pinglogging.bind(this), 200)
        .on('error', logger.error)
        .start();
  }

  // Get the latest telemetry and send it to the interop server.
  async _pinglogging() {
    logger.debug('Fetching telemetry.');

    let { body: serviceping } =
      await request.get(this._serviceurl + '/api/ping')
        .proto(stats.PingTimes)
        .timeout(1000);

    await influx.writePoints([
      {
        measurement: 'Ping',
        fields: { name: this.name, host: this.host, 
          port: this.port, ping: serviceeping },
        tags: {}
      }]).catch(error => {
        console.error('Error saving data to InfluxDB');
      })

    //get telemtry rate

    await influx.writePoints([
      {
        measurement: 'telemetry',
        fields: { t1: , t5:, f1:, f5 }, //input telemtry upload rates
        tags: {}
      }]).catch(error => {
        console.error('Error saving data to InfluxDB');
      })
  }
}