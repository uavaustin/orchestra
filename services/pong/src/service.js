import Koa from 'koa';
import ping from 'net-ping';
import request from 'superagent';
import dns from 'dns';
import { promisify } from 'util';
import ipRegex from 'ip-regex';

import koaLogger from './common/koa-logger';
import logger from './common/logger';
import { createTimeoutTask } from './common/task';

import router from './router';
import PingStore from './ping-store';

/**
 * Service-level implementation for pong.
 */
export default class Service {
  /**
   * Create a new forward-interop service.
   *
   * @param {Object}   options
   * @param {number}   options.port
   * @param {number}   options.serviceTimeout
   * @param {Object[]} options.pingServices
   * @param {string}   options.pingServices[].name
   * @param {string}   options.pingServices[].host
   * @param {number}   options.pingServices[].port
   * @param {string}   options.pingServices[].endpoint
   * @param {Object[]} options.pingDevices
   * @param {string}   options.pingDevices[].name
   * @param {string}   options.pingDevices[].host
   */
  constructor(options) {
    this._port = options.port;

    this._serviceTimeout = options.serviceTimeout;
    this._pingServices = options.pingServices;
    this._pingDevices = options.pingDevices;
  }

  /** Start the service. */
  async start() {
    logger.debug('Starting service.');

    this._pingStore = new PingStore(this._pingServices, this._pingDevices);
    this._server = await this._createApi(this._pingStore);
    this._startTasks();

    logger.debug('Service started.');
  }

  /** Stop the service. */
  async stop() {
    logger.debug('Stopping service.');

    await Promise.all([
      this._server.closeAsync(),
      Promise.all(this._serviceTasks.map(t => t.stop())),
      Promise.all(this._deviceTasks.map(t => t.stop()))
    ]);

    logger.debug('Service stopped.');
  }

  // Create the koa api and return the http server.
  async _createApi(pingStore) {
    const app = new Koa();

    // Make the ping store available to the routes.
    app.context.pingStore = pingStore;

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

      // Add a promisified close method to the server.
      server.closeAsync = () => new Promise((resolve) => {
        server.close(() => resolve());
      });
    });
  }

  // Start the loops for collecting ping times.
  _startTasks() {
    this._serviceTasks = this._pingServices.map((s) => {
      const url = 'http://' + s.host + ':' + s.port + s.endpoint;

      return createTimeoutTask(() => this._pingService(s.name, url), 3000)
        .on('error', logger.error)
        .start();
    });
    this._deviceTasks = this._pingDevices.map((s) => {
      return createTimeoutTask(() => this._pingDevice(s.name, s.host), 3000)
        .on('error', logger.error)
        .start();
    });
  }

  // Hit a service and record how long the request takes round-trip.
  async _pingService(service, url) {
    const start = Date.now();
    let online;

    try {
      await request.get(url)
        .timeout(this._serviceTimeout)
        // Don't follow redirects and consider 3xx status codes as
        // being successful.
        .redirects(0)
        .ok(res => res.status < 400);

      online = true;
    } catch (_err) {
      online = false;
    }

    // Get request time in milliseconds if successful, 0 otherwise.
    const ms = online ? Date.now() - start : 0;

    // Update the ping details.
    this._pingStore.updateServicePing(service, online, ms);
  }

  // Ping device and update how long the request takes.
  async _pingDevice(device, host) {
    const session = ping.createSession();
    let online;
    let ms;
    let ip;

    try {
      if (ipRegex({exact: true, includeBoundaries: true}).test(host)) {
        ip = host;
      } else {
        ip = (await promisify(dns.lookup)(host)).address;
      }
      ms = await new Promise((resolve, reject) => {
        let start = Date.now();
        // Sent is undefined sometimes for unknown reasons,
        // so start is used instead.
        session.pingHost(ip, (err, _target, sent, rcvd) => {
          if (err) reject(err);
          else resolve(rcvd - (sent || start));
        });
      });

      if (ms < 1) ms = 1;

      online = true;
    } catch (_err) {
      ms = 0;
      online = false;
    } finally {
      session.close();
    }

    this._pingStore.updateDevicePing(device, online, ms);
  }
}
