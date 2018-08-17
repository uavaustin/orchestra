import express from 'express';

import { imagery, stats } from './messages';

export function createApp(imageStore) {
    let app = express();

    /** Send a protobuf or JSON if requested. */
    function sendMessage(req, res, msg) {
        let accept = req.get('accept');

        // If the client wants JSON, we'll send them Protobuf-style
        // JSON instead, otherwise, send the Protobuf.
        if (accept === undefined || !accept.startsWith('application/json')) {
            res.set('content-type', 'application/x-protobuf');
            res.send(msg.constructor.encode(msg).finish());
        } else {
            res.json(msg.constructor.toObject(msg));
        }
    }

    /** Get a protobuf Image message based on id. */
    async function getImageMessage(id) {
        let msg = await imageStore.getMetadata(id);

        msg.image = await imageStore.getImage(id);

        return msg;
    }

    app.get('/api/count', (req, res) => {
        // Just return the image count in a ImageCount protobuf
        // message.
        let msg = imagery.ImageCount.create({
            time: (new Date()).getTime() / 1000,
            count: imageStore.getCount()
        });

        sendMessage(req, res, msg);
    });

    app.get('/api/capture-rate', (req, res) => {
        // Returning the rate that images are being captured.
        let msg = stats.ImageCaptureRate.create({
            time: (new Date()).getTime() / 1000,
            rate_5: imageStore.getRate()
        });

        sendMessage(req, res, msg);
    });

    app.get('/api/image/:id', (req, res) => {
        // Carry out the response, gets the image message for the
        // requested id, and then sends it.
        function respondFor(id) {
            getImageMessage(id)
                .then(msg => sendMessage(req, res, msg))
                .catch(err => console.error(err) || res.sendStatus(500));
        }

        if (req.params.id === 'next') {
            // If we want the next image, we'll wait until the image
            // store broadcasts it has a new one, and then we'll
            // return that image.
            imageStore.once('image', id => respondFor(id));
        } else if (req.params.id === 'latest') {
            // If we want the latest image, we'll just get the last
            // image id registered. If there are no images at all,
            // we'll just 404.
            let count = imageStore.getCount();

            if (count === 0) {
                res.sendStatus(404);
            } else {
                respondFor(count - 1);
            }
        } else {
            // Otherwise, we'll parse the integer the user send, make
            // sure it's valid, and then we'll send that.
            let id = parseInt(req.params.id);

            // 404 if this image doesn't exist.
            if (Number.isNaN(id) || id < 0 || id >= imageStore.getCount()) {
                res.sendStatus(404);
            } else {
                respondFor(id);
            }
        }
    });

    app.get('/api/alive', (req, res) => {
        res.set('content-type', 'text/plain');
        res.send('Howdy.\n');
    });

    return app;
}
