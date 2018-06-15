/**
 * Feeds new images into a redis server so workers can process them.
 */

import { promisify } from 'util';

import async from 'async';
import express from 'express';
import _ from 'lodash';
import redis from 'redis';
import request from 'request-promise-native';

import { imagery, interop } from './messages';

import saveBackup from './save-backup'
import { wait } from './util';

const MAX_SUBMISSIONS = 15;
let submissions = 0;

let imageryUrl = process.env.IMAGERY_URL;
let interopProxyUrl = process.env.INTEROP_PROXY_URL;
let redisUrl = process.env.REDIS_URL;

let redisHost = redisUrl.split(':')[0];
let redisPort = redisUrl.split(':')[1] || '6379';

let client = redis.createClient({
    host: redisHost, port: redisPort, return_buffers: true
});
let clientQueue = client.duplicate();
let clientSubmit = client.duplicate();

// Promisifying the redis client methods.
clientSubmit.brpopAsync = promisify(clientSubmit.brpop).bind(clientSubmit);
clientQueue.brpoplpushAsync = promisify(clientQueue.brpoplpush).bind(clientQueue);
client.lrangeAsync = promisify(client.lrange).bind(client);
client.lpushAsync = promisify(client.lpush).bind(client);

// The list of unprocessed images already on redis.
let initialUnprocessed;

/* Get a list of numbers from redis. */
async function getIntList(key) {
    return (await client.lrangeAsync(key, 0, -1)).map(id => parseInt(id));
}

// Last id number in the imagery service.
let lastId = -1;

/* Find the latest image number, and then add it to redis. */
async function updateUnprocessed() {
    let msg = await request({
        uri: `http://${imageryUrl}/api/count`,
        encoding: null,
        transform: buffer => imagery.ImageCount.decode(buffer),
        transform2xxOnly: true,
        timeout: 5000
    });

    let nextId = msg.count - 1;

    if (nextId > lastId) {
        // Making sure we add all the images after the last, and
        // including the most recent.
        let range = _.range(lastId + 1, nextId + 1);

        // Adding the new images on the left side of the list (as
        // long as they are not in the initial list.
        if (!_.includes(initialUnprocessed, nextId))
            await client.lpushAsync('unprocessed-images', range);

        lastId = nextId;
    }
}

/** Submit the next target in the list to submit. */
async function submitNextOdlc() {
    submissions++;

    if (submissions > MAX_SUBMISSIONS) {
        throw Error('Maximum number of submissions reached.');
    }

    let [_, next] = await clientSubmit.brpopAsync('to-submit', 0);

    let submitted = false;

    // Keep trying to submit a target.
    while (!submitted) {
        try {
            console.log(interop.Odlc.decode(next));

            let msg = await request({
                method: 'POST',
                uri: `http://${interopProxyUrl}/api/odlcs`,
                headers: {
                    'content-type': 'application/x-protobuf',
                    'accept': 'application/x-protobuf',
                    'content-length': next.length
                },
                encoding: null,
                body: next,
                transform: buffer => interop.Odlc.decode(buffer),
                transform2xxOnly: true,
                timeout: 5000
            });

            console.log(`Successfully submitted target id ${msg.id}`);
            submitted = true;
        } catch (err) {
            console.error('Error while submitting target... trying again.');
            console.error(err);

            await wait(1000);
        }
    }
}

/** Move the odlc into the submission queue if applicable. */
async function queueNextOdlc() {
    // FIXME: save these in a list to see which targets are actually
    //        new.
    await clientQueue.brpoplpushAsync('found', 'to-submit', 0);
}

// First populate the initial unprocessed list, then constantly check
// for new images, and put them in the unprocessed images list in
// redis.
(async function () {
    initialUnprocessed = await getIntList('unprocessed-images');

    async.forever((next) => {
        updateUnprocessed()
            .then(() => setTimeout(next, 500))
            .catch((err) => console.error(err) || setTimeout(next, 500));
    });
})();

// Continuously submit obstcales that are ready to be submitted.
async.forever((next) => {
    submitNextOdlc()
        .then(() => next())
        .catch((err) => console.error(err) || setTimeout(next, 500));
});

// Queue the obstacles and check which are not duplicates (and back
// them up in the `/found` volume).
async.forever((next) => {
    queueNextOdlc()
        .then(() => next())
        .catch((err) => console.error(err) || setTimeout(next, 500));
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
        res.send(msg.constructor.encode(msg).finish());
    } else {
        res.json(msg.constructor.toObject(msg));
    }
}

// Returning the list of unprocessed images.
app.get('/api/unprocessed', (req, res) => {
    getIntList('unprocessed-images')
        .then((list) => {
            sendMessage(req, res, imagery.UnprocessedImages.create({
                count: list.length,
                list: list
            }));
        })
        .catch(err => console.error(err) || res.sendStatus(500));
});

app.get('/api/alive', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send('Wazzup?\n');
});

app.listen(8082);

console.log('Running server with Express at http://0.0.0.0:8082');
