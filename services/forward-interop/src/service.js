import async from 'async';
import Koa from 'koa';
import request from 'request-promise-native';

import koaLogger from './common/koa-logger';
import logger from './common/logger';
import { interop } from './messages';

import router from './router';
import UploadMonitor from './upload-monitor';

export default class Service {
  constructor(options) {
    this._port = options.port;

    this._telemetryUrl =
      `http://${options.telemetryHost}:${options.telemetryPort}`;
    this._interopProxyUrl =
      `http://${options.interopProxyHost}:${options.interopProxyPort}`;
  }

  async start() {
    logger.debug('Starting service.');

    this._monitor = new UploadMonitor();
    this._server = await this._createApi(this._monitor);
    this._startLoop();

    logger.debug('Service started.');
  }

  async stop() {
    logger.debug('Stopping service.');

    let closeServer = new Promise((resolve) => {
      this._server.close(() => resolve());
    });

    let closeLoop = new Promise((resolve) => {
      this._loopActive = false;

      // If there's a timeout going, kill it and then the loop is no
      // longer executing. Otherwise, make a function to finish the
      // closing process, and wait until the loop sees that the
      // active flag is set to the false and calls it.
      if (this._loopTimeout) {
        clearTimeout(this._loopTimeout);
        resolve();
      } else {
        this._finishLoop = () => {
          delete this._finishLoop;
          resolve();
        };
      }
    });

    await Promise.all([closeServer, closeLoop]);

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
    await new Promise((resolve, reject) => {
      let server = app.listen(this._port, (err) => {
        if (err) reject(err);
        else resolve(server);
      });
    });
  }

  // Start the loop for forwarding telemetry and kill it when the
  // server is being stopped.
  _startLoop() {
    this._loopActive = true;

    async.forever((next) => {
      this._forwardTelem()
        .catch(err => logger.error(err.message))
        .then(() => {
          // Only continue if the loop isn't being stopped.
          if (this._loopActive === false) {
            this._finishLoop();
          } else {
            this._loopTimeout = setTimeout(() => {
              delete this._loopTimeout;
              next();
            }, 250);
          }
        });
    });
  }

  // Get the latest telemetry and send it to the interop server.
  async _forwardTelem() {
    logger.debug('Fetching telemetry.');

    // Getting the telemetry buffer from the telemetry service.
    let buffer = await request.get({
      uri: this._telemetryUrl + '/api/interop-telem',
      headers: {
        'accept': 'application/x-protobuf'
      },
      encoding: null,
      timeout: 1000
    });

    // Forward the Protobuf buffer to interop proxy.
    await request.post({
      uri: this._interopProxyUrl + '/api/telemetry',
      body: buffer,
      headers: {
        'content-type': 'application/x-protobuf'
      },
      timeout: 1000
    });

    logger.debug('Uploaded telemetry.');

    // Decode the buffer and update the monitor.
    let telem = interop.InteropTelem.decode(buffer);

    this._monitor.addTelem({
      lat: telem.pos.lat,
      lon: telem.pos.lon,
      alt_msl: telem.pos.alt_msl,
      yaw: telem.yaw
    });
  }
}
