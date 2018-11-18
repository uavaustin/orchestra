import { createApp } from './app';
import GPhoto2Backend from './backends/gphoto2-backend';
import FileBackend from './backends/file-backend';
import SyncBackend from './backends/sync-backend';
import ImageStore from './image-store';

const BACKENDS = ['gphoto2', 'file', 'sync'];

export default class Service {
    /**
     * Create a new service object.
     *
     * To start the service, see start().
     *
     * @param {Object}  options
     * @param {number}  options.port
     * @param {string}  options.backend           - one of 'gphoto2',
     *                                              'file', 'sync'
     * @param {string}  [options.imagerySyncUrl]  - url to sync
     *                                              imagery against
     * @param {string}  [options.telemUrl]        - url to get
     *                                              telemetry from
     * @param {boolean} [options.printNew=false]  - prints when a new
     *                                              image is added
     * @param {number}  [options.captureInterval] - capture interval
     *                                              for the gphoto2
     *                                              backend
     */
    constructor(options) {
        if (BACKENDS.indexOf(options.backend) === -1) {
            throw Error('Invalid backend type');
        }

        this._port = options.port;
        this._backend = options.backend;

        this._imagerySyncUrl = options.imagerySyncUrl;
        this._telemUrl = options.telemUrl;

        this._printNew = options.printNew;

        this._captureInterval = options.captureInterval;
    }

    /**
     * Starts the service with the options from the constructor.
     *
     * @return {Promise.<void>}
     */
    async start() {
        let imageStore = new ImageStore();

        await imageStore.setup();

        if (this._printNew === true) {
            imageStore.on('image', id => console.log(`Added image ${id}.`));
        }

        let app = createApp(imageStore);
        let backend;

        switch (this._backend) {
            case 'gphoto2':
                backend = new GPhoto2Backend(
                    imageStore, this._captureInterval, this._telemUrl
                );
                break;
            case 'file':
                backend = new FileBackend(imageStore);
                break;
            case 'sync':
                backend = new SyncBackend(imageStore, this._imagerySyncUrl);
        }

        await backend.start();

        return await (new Promise((resolve, reject) => {
            app.listen(this._port, (err) => {
                if (err) reject(err);
                else resolve();
            });
        }));
    }
}
