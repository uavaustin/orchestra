import Koa from 'koa';
import { assert } from 'chai';
import request from 'superagent';
import addProtobuf from 'superagent-protobuf';
import koaLogger from './common/koa-logger';
import logger from './common/logger';
import { telemetry, interop, pathfinder } from './messages';

import router from './router';
import Pather from './pather'


addProtobuf(request);

export default class Service {
  /**
   * Create a new autopilot (tanstar) service.
   *
   * @param {Object}   options
   * @param {number}   options.port
   * @param {number}   options.serviceTimeout
   * @param {string}   options.interopProxyHost
   * @param {number}   options.interopProxyPort
   */
  constructor(options) {
    this._port = options.port;
    this._serviceTimeout = options.serviceTimeout;

    this._pather = null;
    this._server = null;
  }

  /**
   * Starts all the necessary tasks for the service.
   */
  async start(){
    logger.info('tanstar starting up');
    this._pather = new Pather;
    await this._pather.connect();
    this._server = await this._createApi(this._pather);
    logger.info('up and running!');
  }

  /**
   * Shut down the currently running service
   */
  async stop(){
    assert(this._server != null);

    logger.info('tanstar shutting down');
    await this._pather.disconnect();
    await this._server.closeAsync();
    logger.info('tanstar shut down');
  }

  /**
   * Sets up new Koa app using specified routes and port numbers.
   */
  async _createApi(pather){
    let app = new Koa();

    app.context.pather = pather;

    app.use(koaLogger());

    // Set up the router middleware.
    app.use(router.routes());
    app.use(router.allowedMethods());

    // Start and wait until the server is up and then return it.
    return await new Promise((resolve, reject) => {
      const server = app.listen(this._port, err => {
        if (err) {
          logger.error(`Can't listen on ${this._port}`);
          reject(err);
        }
        else resolve(server);
      });
      server.closeAsync = () => new Promise(resolve =>{
        server.close(() => resolve());
      })
    });
  }
}
