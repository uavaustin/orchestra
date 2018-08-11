import Koa from 'koa';
import request from 'superagent';
import addProtobuf from 'superagent-protobuf';

import koaLogger from './common/koa-logger';
import logger from './common/logger';
import { createTimeoutTask } from './common/task';
import { interop } from './messages';

import router from './router';
import UploadMonitor from './upload-monitor';

addProtobuf(request);

/**
 * Service-level implementation for forward-interop.
 *
 * When run, this service forward telemetry from the telemetry
 * service to the interop-proxy service on an interval.
 *
 * An API is also hosted which serves the rate at which raw and
 * unique telemetry over the last 1 or 5 seconds.
 */
export default class Service {
  /**
   * Create a new forward-interop service.
   *
   * @param {Object} options
   * @param {number} options.port
   * @param {string} options.telemetryHost
   * @param {number} options.telemetryPort
   * @param {string} options.interopProxyHost
   * @param {string} options.interopProxyPort
   */
  constructor(options) {
    this._port = options.port;

    this._telemetryUrl =
      `http://${options.telemetryHost}:${options.telemetryPort}`;
    this._interopProxyUrl =
      `http://${options.interopProxyHost}:${options.interopProxyPort}`;
  }

  /** Start the sevice. */
  async start() {
    logger.debug('Starting service.');

    this._monitor = new UploadMonitor();
    this._server = await this._createApi(this._monitor);
    this._startTask();

    logger.debug('Service started.');
  }

  /** Stop the service. */
  async stop() {
    logger.debug('Stopping service.');

    await Promise.all([
      this._server.closeAsync(),
      this._forwardTask.stop()
    ]);

    logger.debug('Service stopped.');
  }

  // Create the koa api and return the http server.
  async _createApi(monitor) {
    let app = new Koa();

    // Make the monitor available to the routes.
    app.context.uploadMonitor = monitor;

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

  // Start the loop for forwarding telemetry.
  _startTask() {
    this._forwardTask =
      createTimeoutTask(this._forwardTelem.bind(this), 200)
        .on('error', logger.error)
        .start();
  }

  // Get the latest telemetry and send it to the interop server.
  async _forwardTelem() {
    logger.debug('Fetching telemetry.');

    // Getting the telemetry from the telemetry service.
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
