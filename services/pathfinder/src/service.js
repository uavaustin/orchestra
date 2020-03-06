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

 //create the koa api, and return the http server
 async _createApi(nsfw) {
   let app = new Koa();

   //make nsfw available to the router
   app.context.nsfw = nsfw;

   app.use(koaLogger());

   //router middleware
   app.use(router.routes());
   app.use(router.allowedMethods()); //what is allowedMethods? this is also in plane service code

   //start snd wait until server is up; then, return it!
   return await new Promise((resolve, reject) => {
     let server = app.listen(this._port, (err) => {
       if (err) reject(err);
       else resolve(server);
     });

     //add a promisified close method to the server.
     server.closeAsync = () => new Promise((resolve) => {
       server.close(() => resolve());
     });
   });
 }
}

// find endpoints

// start server


// basic functionality
