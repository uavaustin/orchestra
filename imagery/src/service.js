import app from './app';

export default class Service {
    /**
     * Create a new service object.
     *
     * To start the service, see start().
     *
     * @param {Object} options
     * @param {number} options.port
     */
    constructor(options) {
        this._port = options.port;
    }

    /**
     * Starts the service with the options from the constructor.
     *
     * @return {Promise.<void>}
     */
    async start() {
        return new Promise((resolve, reject) => {
            this._server = app.listen(this._port, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    }
}
