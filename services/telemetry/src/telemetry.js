import Koa from 'koa';

import PlaneLink from './link';
import router from './router';

export default class Telemetry {
    constructor() {
        this._plane = null;
        this._server = null;

        this._port = 5000;
    }

    async start() {
        if (this._server) {
            throw Error('Telemetry server is already running');
        }

        this._plane = new PlaneLink();
        await this._plane.connect();

        this._server = await this._createApi(this._plane);
    }

    async stop() {
        await this._plane.disconnect();
        await this._server.closeAsync();

        this._server = null;
    }

    // Create the koa api and return the http server.
    async _createApi(plane) {
        let app = new Koa();

        // Make the plane available to the routes.
        app.context.plane = plane;

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
