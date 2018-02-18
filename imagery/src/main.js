/**
 * Entrypoint for running the service.
 */

import Service from './service';

let options = {
    port: 9000,
    telemUrl: process.env.TELEMETRY_URL
};

(new Service(options)).start()
    .then(() => console.log(
        'Running server with Express at http://0.0.0.0:9000'
    ))
    .catch(console.error);
