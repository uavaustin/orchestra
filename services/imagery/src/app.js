import express from 'express';

import { Image, ImageCount } from './messages/imagery_pb';

export function createApp(imageStore) {
    let app = express();

    /** Send a protobuf or JSON if requested. */
    function sendMessage(req, res, msg) {
        let accept = req.get('accept');

        // If the client wants JSON, we'll send them Protobuf-style
        // JSON instead, otherwise, send the Protobuf.
        if (accept === undefined || !accept.startsWith('application/json')) {
            res.set('content-type', 'application/x-protobuf');
            res.send(Buffer.from(msg.serializeBinary()));
        } else {
            res.send(msg.toObject());
        }
    }

    /** Get a protobuf Image message based on id and query. */
    async function getImageMessage(id, query) {
        let msg = await imageStore.getMetadata(id);

        // By default, we should return the original image if it is
        // available, but not the warped unless it is requested.
        let original = query.original !== '0' && query.original !== 'false';
        let warped = query.warped === '1' || query.warped === 'true';

        if (original)
            msg.setImage(await imageStore.getImage(id));

        if (warped && msg.getHasWarped())
            msg.setWarpedImage(await imageStore.getImage(id, true));

        return msg;
    }

    app.get('/api/count', (req, res) => {
        // Just return the image count in a ImageCount protobuf
        // message.
        let msg = new ImageCount();

        msg.setTime((new Date()).getTime() / 1000);
        msg.setCount(imageStore.getCount());

        sendMessage(req, res, msg);
    });

    app.get('/api/image/:id', async (req, res) => {
        // Carry out the response, gets the image message for the
        // requested id, and then sends it.
        async function respondFor(id) {
            let msg = await getImageMessage(id, req.query);

            sendMessage(req, res, msg);
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
