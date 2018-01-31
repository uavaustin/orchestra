import async from 'async';
import express from 'express';
import request from 'request-promise-native';

import UploadMonitor from './upload-monitor';

import { InteropTelem } from './messages/interop_pb';
import { InteropUploadRate } from './messages/stats_pb';

let interopProxyUrl = process.env.INTEROP_PROXY_URL;
let telemUrl = process.env.TELEMETRY_URL;

let monitor = new UploadMonitor();

/**
 * Get the latest telemetry and send it to the interop server.
 *
 * Afterwords, the telemetry will be added to the monitor.
 *
 * @return {Promise.<void, Error>}
 */
async function sendTelem() {
    // Getting the telemetry from the telemetry service.
    let telem = await request.get({
        uri: 'http://' + telemUrl + '/api/interop-telem',
        encoding: null,
        headers: {
            'accept': 'application/x-protobuf'
        },
        transform: buffer => InteropTelem.deserializeBinary(
            buffer.buffer.slice(
                buffer.byteOffset, buffer.byteOffset + buffer.byteLength
            )
        )
    });

    // Forward the Protobuf buffer to interop proxy.
    await request.post({
        uri: 'http://' + interopProxyUrl + '/api/telemetry',
        body: telem.serializeBinary(),
        headers: {
            'content-type': 'application/x-protobuf'
        }
    });

    monitor.addTelem({
        lat: telem.getPos().getLat(),
        lon: telem.getPos().getLon(),
        alt_msl: telem.getPos().getAltMsl(),
        yaw: telem.getYaw()
    });
}

// Continuously sending telemetry every 200 ms.
async.forever((next) => {
    sendTelem()
        .then(() => setTimeout(next, 200))
        .catch((err) => console.error(err) || setTimeout(next, 50));
}, err => console.error(err) || process.exit(1));

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

    // If the client wants JSON, we'll send them Protobuf-style JSON
    // instead, otherwise, send the Protobuf.
    let accept = req.get('accept');

    if (accept === undefined || !accept.startsWith('application/json')) {
        res.set('content-type', 'application/x-protobuf');
        res.send(Buffer.from(msg.serializeBinary()));
    } else {
        res.send(msg.toObject());
    }
});

app.get('/api/alive', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send('Yo dude, I\'m good.\n');
});

app.listen(4000);
