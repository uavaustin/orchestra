/**
 * Entrypoint for running the service.
 */

import Service from './service';

let options = {
    port: 9000,
    backend: process.env.BACKEND,
    telemUrl: process.env.TELEMETRY_URL,
    imagerySyncUrl: process.env.IMAGERY_SYNC_URL,
    printNew: process.env.PRINT_NEW in ['1', 'true', 'TRUE']
};

(new Service(options)).start()
    .then(() => console.log(
        'Running server with Express at http://0.0.0.0:9000'
    ))
    .catch(console.error);
