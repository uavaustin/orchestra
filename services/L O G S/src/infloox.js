import Koa from 'koa';
import Influx from 'influx';

export default class Service {
  /**
   * Create a new forward-interop service.
   * host
   * name
   * port
   * ping
   * t1
   * t5
   * f1
   * f5
   */

  constructor(options) {      
   this._name = options.name;
   this._host = options.host;
   this._port = options.port;

   this._t1 = options.t1;
   this._t5 = options.t5;
   this._f1 = options.f1;
   this._f5 = options.f5;
  }

  /** Start the service. */
  async start() {
    const influx = new Influx.InfluxDB({
    host: 'localhost',
    database: 'sojuwu',
    schema: [
      {
        measurement: 'response_times',
        fields: {
         name: Influx.FieldType.STRING,
         port: Influx.FieldType.INTEGER,
         ping: Influx.FieldType.INTEGER
        },
        tags: [
          'ping'
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
          'telem_data'
        }
      }
     ]
    })


  }

  /** Stop the service. */
  async stop() {

  }

  // Create the koa api and return the http server.
  async _createApi(monitor) {
 
  }

  /// Start the loop for forwarding telemetry.
  _startTask() {
    this._forwardTask =
      createTimeoutTask(this._forwardTelem.bind(this), 200)
        .on('error', logger.error)
        .start();
  }

  // Get the latest telemetry and send it to the interop server.
  async _forwardTelem() {
    logger.debug('Fetching telemetry.');

    // Get the telemetry from the telemetry service.
    let { body: telem } =
      await request.get(this._telemetryUrl + '/api/interop-telem')
        .proto(interop.InteropTelem)
        .timeout(1000);

    // Forward the telemetry to interop proxy.
    await request.post(this._interopProxyUrl + '/api/telemetry')
      .sendProto(telem)
      .timeout(1000);

    logger.debug('Uploaded telemetry.');

    this._monitor.addTelem({
      lat: telem.pos.lat,
      lon: telem.pos.lon,
      alt_msl: telem.pos.alt_msl,
      yaw: telem.yaw
    });
  }


}