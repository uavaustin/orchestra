import Koa from 'koa';
import { assert } from 'chai';
import request from 'superagent';
import addProtobuf from 'superagent-protobuf';
import koaLogger from './common/koa-logger';
import logger from './common/logger';
import router from './router';
import { telemetry, interop } from './messages';

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
<<<<<<< HEAD
    this._server = null;
  }

  /* Start the service */
=======
    this._interopUrl = 
      `http://${options.interopProxyHost}:${options.interopProxyPort}`;
  }
  
  /**
   * Starts all the necessary tasks for the service.
   */
>>>>>>> d8e03e48dc97ef02fb1d15335ca24b3d1a350744
  async start(){
    logger.info('tanstar starting up');
    this._server = await this._createApi();
    logger.info('up and running!');
  }

<<<<<<< HEAD

  /* Stop the service */
  async stop(){
    logger.info('Stopping service.');

    await this._server.closeAsync();
    this._server = null;

    logger.info('Service stopped.');
  }

=======
  /**
   * Shut down the currently running service
   */
  async stop(){
    assert(this._server != null);

    logger.info('tanstar shutting down');
    await this._server.closeAsync();
    logger.info('tanstar shut down');
  }

  /**
   * Sets up new Koa app using specified routes and port numbers.
   */
>>>>>>> d8e03e48dc97ef02fb1d15335ca24b3d1a350744
  async _createApi(){
    const app = new Koa();

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
<<<<<<< HEAD
}
=======

  /**
   * Retrieves stationary obstacle information from interop-proxy.
   * 
   * @return An interop obstacle message with the time and the 
   *         stationary obstacles array. Null if unable get mission
   *         data.
   */
  async _retrieveObstacles(){
    const url = this._interopUrl + '/api/obstacles';
    try {
      const res = await request.get(url)
                  .timeout(this._serviceTimeout)
                  .proto(interop.Obstacles);
      return res.body;
    } catch (_err) {
      logger.error('Unable to get mission data from interop-proxy');
      return null;
    }
  }
}
>>>>>>> d8e03e48dc97ef02fb1d15335ca24b3d1a350744
