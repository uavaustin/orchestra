import async from 'async';
import request from 'request-promise-native';

import AUVSIClient from 'auvsisuas-client';
import { InteropTelem } from './messages/telemetry_pb.js';

let interopUrl = process.env.INTEROP_URL;
let username = process.env.USERNAME;
let password = process.env.PASSWORD;

let telemUrl = process.env.TELEMETRY_URL;

let client = new AUVSIClient();

/**
 * Get the latest telemetry and send it to the interop server.
 *
 * @return {Promise.<void, Error>}
 */
function sendTelem() {
    return request.get('http://' + telemUrl + '/api/interop-telem?json=true')
        .then(JSON.parse)
        .then((telem) => {
            return client.postTelemetry({
                lat: telem.lat,
                lon: telem.lon,
                alt_msl: telem.altFeetMsl,
                yaw: telem.yaw
            });
        });
}

client.login('http://' + interopUrl, username, password, 5000)
    .then(() => console.log('Login Sucessful.'))
    .then(() => console.log('Now forwarding telemetry...'))
    .then(() => {
        // This promise should never actually resolve, if so, that
        // means we're not continuously sending telemetry.
        return new Promise((resolve, reject) => {
            // Continuously send telemetry every 200 ms.
            async.forever((next) => {
                sendTelem()
                    .then(() => setTimeout(next, 200))
                    .catch(next);
            }, reject);
        });
    })
    .then(() => { throw new Error('Telemetry loop stopped!') })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
