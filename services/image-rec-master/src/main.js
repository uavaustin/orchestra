/**
 * Feeds new images into a redis server so workers can process them.
 */

import async from 'async';
import express from 'express';
import _ from 'lodash';
import redis from 'redis';
import request from 'request';

import { ImageCount, UnprocessedImages } from './messages/imagery_pb';

let imageryUrl = process.env.IMAGERY_URL;
let redisUrl = process.env.REDIS_URL;

let redisHost = redisUrl.split(':')[0];
let redisPort = redisUrl.split(':')[1] || '6379';

let client = redis.createClient({ host: redisHost, port: redisPort });

/** Convert a Buffer to a Uint8Array for Protobuf message objects. */
function toUint8Array(buffer) {
    return new Uint8Array(buffer.buffer.slice(
        buffer.byteOffset, buffer.byteOffset + buffer.byteLength
    ));
}

// Constantly check for new images, and put them in the unprocessed
// images list in redis.
let lastId = -1;

async.forever((next) => {
    request.get({
        url: 'http://' + imageryUrl + '/api/count',
        encoding: null,
        timeout: 5000
    }, (err, res) => {
        if (err) {
            console.error(err);
            setTimeout(next, 500);
        } else {
            let msg = ImageCount.deserializeBinary(toUint8Array(res.body));
            let nextId = msg.getCount() - 1;

            if (nextId > lastId) {
                // Making sure we add all the images after the last,
                // and including the most recent.
                let range = _.range(lastId + 1, nextId + 1);

                // Adding the new images on the left side of the
                // list.
                client.rpush('unprocessed-images', range, (err) => {
                    if (err) console.error(err);
                    else lastId = nextId;

                    setTimeout(next, 500);
                });
            } else {
                setTimeout(next, 500);
            }
        }
    });
});

// Making a simple api to show what's left to be processed.
let app = express();

/** Send a Protobuf message. */
function sendMessage(req, res, msg) {
    // If the client wants JSON, we'll send them Protobuf-style JSON
    // instead, otherwise, send the Protobuf.
    let accept = req.get('accept');

    if (accept === undefined || !accept.startsWith('application/json')) {
        res.set('content-type', 'application/x-protobuf');
        res.send(Buffer.from(msg.serializeBinary()));
    } else {
        res.send(msg.toObject());
    }
}

// Returning the list of unprocessed images.
app.get('/api/unprocessed', (req, res) => {
    client.lrange('unprocessed-images', 0, -1, (err, list) => {
        if (err) {
            res.sendStatus(500);
            return;
        }

        let msg = new UnprocessedImages();

        msg.setCount(list.length);
        msg.setListList(list.map(id => parseInt(id)));

        sendMessage(req, res, msg);
    });
});

app.get('/api/alive', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send('Wazzup?\n');
});

app.listen(8082);

console.log('Running server with Express at http://0.0.0.0:8082');
