// imports
import Koa from 'koa';



import Pathfinder from './pathfinder';
import router from './router';

// New pathfinder service
export default class Service {
  /**
  * @param {Object} options
  * @param {number} options.port
  * @param {string} options.pathfinderHost
  * @param {number} options.pathfinderPort
  */


  constructor(options) {
   this._port = options.port;

   this._planeHost = options.pathfinderHost;
   this._planePort = options.pathfinderPort;

   this._pathfinder = null;
   this._server = null;
 }

 // Start service
 async start() {
   logger.debug('Starting service.');


   // creating new instance of Pathfinder, needs defining
   this._pathfinder = new Pathfinder({ host: this._pathfinderHost, port: this._pathfinderPort});
   await this_pathfinder.connect();

   this._server = await this._createApi(this.pathfinder);

   // more?

   logger.debug('Service started.');
 }

 async stop() {
   logger.debug('Stopping service.');

   await this._pathfinder.disconnect();
   await this._server.closeAsync();

   this._server = null;

   logger.debug('Service stopped.');
 }

}



// find endpoints

// start server


// basic functionality
