/**
 * Entrypoint for running the service.
 */

import Service from './service';

let options = {
    port: 8081,
    backend: process.env.BACKEND,
    imagerySyncUrl: process.env.IMAGERY_SYNC_URL,
    printNew: process.env.PRINT_NEW in ['1', 'true', 'TRUE'],
    captureInterval: parseFloat(process.env.CAPTURE_INTERVAL) || 2.0
};

(new Service(options)).start()
    .then(() => console.log(
        'Running server with Express at http://0.0.0.0:8081'
    ))
    .catch(console.error);
