import express from 'express';

import { Image } from './messages/imagery_pb';

/** Send a protobuf or JSON if requested. */
function sendMessage(req, res, msg) {
    let accept = req.get('accept');

    // If the client wants JSON, we'll send them Protobuf-style JSON
    // instead, otherwise, send the Protobuf.
    if (accept === undefined || !accept.startsWith('application/json')) {
        res.set('content-type', 'application/x-protobuf');
        res.send(Buffer.from(msg.serializeBinary()));
    } else {
        res.send(msg.toObject());
    }
}

export function createApp(imageStore) {
    let app = express();

    app.get('/api/image/:id', async (req, res) => {
        let id = parseInt(req.params.id);

        // 404 if this image doesn't exist.
        if (Number.isNaN(id) || id < 0 || id >= imageStore.getCount()) {
            res.sendStatus(404);
            return;
        }

        let msg = await imageStore.getMetadata(id);

        msg.setImage(await imageStore.getImage(id));

        sendMessage(req, res, msg);
    });

    app.get('/api/next-image', (req, res) => {
        imageStore.once('image', async (id) => {
            let msg = await imageStore.getMetadata(id);

            msg.setImage(await imageStore.getImage(id));

            sendMessage(req, res, msg);
        });
    });

    app.get('/api/alive', (req, res) => {
        res.set('content-type', 'text/plain');
        res.send('Howdy.\n');
    });

    return app;
}
