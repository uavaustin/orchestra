import Koa from 'koa';
import koaLogger from './common/koa-logger';
import logger from './common/logger';
import router from './router';

export default class Service {
  /**
   * Create a new autopilot (tanstar) service.
   *
   * @param {Object}   options
   * @param {number}   options.port
   * @param {number}   options.serviceTimeout
   */
  constructor(options) {
    this._port = options.port;
    this._serviceTimeout = options.serviceTimeout;
    this._server = null;
  }

  /* Start the service */
  async start(){
    logger.info('tanstar starting up');
    this._server = await this._createApi();
    logger.info('up and running!');
  }


  /* Stop the service */
  async stop(){
    logger.info('Stopping service.');

    await this._server.closeAsync();
    this._server = null;

    logger.info('Service stopped.');
  }

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
}
