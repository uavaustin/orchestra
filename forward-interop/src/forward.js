import async from 'async';
import express from 'express';
import request from 'request-promise-native';

import AUVSIClient from 'auvsisuas-client';

import UploadMonitor from './upload-monitor';

import { InteropTelem } from './messages/telemetry_pb';
import { InteropUploadRate } from './messages/stats_pb';

let interopUrl = process.env.INTEROP_URL;
let username = process.env.USERNAME;
let password = process.env.PASSWORD;

let telemUrl = process.env.TELEMETRY_URL;

let client = new AUVSIClient();
let monitor = new UploadMonitor();

/**
 * Get the latest telemetry and send it to the interop server.
 *
 * @return {Promise.<void, Error>}
 */
function sendTelem() {
    // Requesting protobuf data, so we're transforming this into a
    // protobuf.js object fist
    return request.get({
            uri: 'http://' + telemUrl + '/api/interop-telem',
            encoding: null,
            // Converting Buffer to UInt8Array and then converting
            // that to a protobuf object
            transform: (buffer) => InteropTelem.deserializeBinary(
                buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset 
                        + buffer.byteLength)
            )
        })
        .then((telem) => {
            // Parsing the object into a regular JS object for
            // posting telemetry and updating the monitor.
            return {
                lat: telem.getLat(),
                lon: telem.getLon(),
                alt_msl: telem.getAltFeetMsl(),
                yaw: telem.getYaw()
            };
        })
        .then((telem) => {
            return client.postTelemetry(telem)
                .then(() => monitor.addTelem(telem));
        });
}

// Logging into the competition server and continuously sending
// telmetry.
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
    .then(() => { throw Error('Telemetry loop stopped!') })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });

// Making a simple api to check how often telemetry is being sent and
// how much of that is unique.
let app = express();

app.get('/api/upload-rate', (req, res) => {
    // Get the rate, verify it is a valid message, and create the
    // message.
    let rate = monitor.getUploadRate();

    let msg = new InteropUploadRate();

    msg.setTime(rate.time);
    msg.setTotal1(rate.total1);
    msg.setTotal5(rate.total5);
    msg.setFresh1(rate.fresh1);
    msg.setFresh5(rate.fresh5);

    // If json=true is in the query params, return JSON, otherwise,
    // return a protobuf.
    if (req.query.json !== undefined && req.query.json == 'true') {
        res.send(msg.toObject());
    } else {
        res.set('Content-Type', 'application/x-protobuf');
        res.send(Buffer.from(msg.serializeBinary()));
    }
});

app.get('/api/alive', (req, res) => {
    res.send('Yo dude, I\'m good.\n');
});

app.listen(4000);
