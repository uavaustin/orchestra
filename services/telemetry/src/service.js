import Koa from 'koa';

import koaLogger from './common/koa-logger';
import logger from './common/logger';

import Plane from './plane';
import router from './router';

/**
 * Service-level implementation for telemetry.
 *
 * An API is hosted which serves general telemetry and allows for the
 * getting and setting of missions.
 */
export default class Service {
  /**
   * Create a new telemetry service.
   *
   * @param {Object} options
   * @param {number} options.port
   * @param {string} options.planeHost
   * @param {number} options.planePort
   */
  constructor(options) {
    this._port = options.port;

    this._planeHost = options.planeHost;
    this._planePort = options.planePort;

    this._plane = null;
    this._server = null;
  }

  /** Start the service. */
  async start() {
    logger.debug('Starting service.');

    this._plane = new Plane({ host: this._planeHost, port: this._planePort });
    await this._plane.connect();

    this._server = await this._createApi(this._plane);

    logger.debug('Service started.');
  }

  /** Stop the service. */
  async stop() {
    logger.debug('Stopping service.');

    await this._plane.disconnect();
    await this._server.closeAsync();

    this._server = null;

    logger.debug('Service stopped.');
  }

  // Create the koa api and return the http server.
  async _createApi(plane) {
    let app = new Koa();

    // Make the plane available to the routes.
    app.context.plane = plane;

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
}
