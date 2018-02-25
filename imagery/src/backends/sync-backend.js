import request from 'request-promise-native';

import { toUint8Array, wait } from '../util';

import { Image, ImageCount } from '../messages/imagery_pb';

export default class SyncBackend {
    /**
     * Backend which pulls data from another imagery service.
     *
     * This is useful for mirroring imagery data on another machine
     * from where the imagery originates from.
     *
     * Telemetry data is simply gathered from the original image.
     */

    /** Create a new sync backend. */
    constructor(imageStore, syncUrl) {
        this._imageStore = imageStore;
        this._syncUrl = syncUrl;
        this._active = false;
    }

    async _runLoop() {
        // The last image number we've fetched.
        let lastId = this._imageStore.getCount() - 1;

        while (this._active) {
            try {
                // First we'll just see what the latest id number is.
                let latestId = await this._getLatestId();

                // Throw an error if the id number went down.
                if (latestId < lastId)
                    throw Error('Unexpected latest id number');

                // Getting the images we don't have.
                for (let id = lastId + 1; id <= latestId; id++) {
                    console.log('Fetching image: ' + id);

                    let msg = await this._getImage(id);

                    // Getting the image data from the message.
                    let image = msg.getImage();
                    let warped = msg.getHasWarped() ?
                            msg.getWarpedImage() : undefined;

                    // Clearing the image data so only metadata is
                    // left.
                    msg.setImage(null);
                    msg.setWarpedImage(null);

                    // Adding it to the image store.
                    await this._imageStore.addImage(image, warped, msg);
                }

                lastId = latestId;
            } catch (err) {
                let message = err.name + ': ' + err.message;
                console.error('Encountered an error in sync loop: ' + message);
            }

            // Wait 250 ms to continue.
            await wait(250);
        }
    }

    /** Get the latest id number the sync url has. */
    async _getLatestId() {
        let msg = await request({
            uri: `http://${this._syncUrl}/api/count`,
            encoding: null,
            transform: buffer => ImageCount.deserializeBinary(
                toUint8Array(buffer)
            ),
            transform2xxOnly: true,
            timeout: 5000
        });

        return msg.getCount() - 1;
    }

    /** Get an image from the sync url by id. */
    async _getImage(id) {
        return await request({
            uri: `http://${this._syncUrl}/api/image/${id}`,
            qs: {
                // Making sure we have both the image and warped
                // image if it's available.
                original: 'true',
                warped: 'true'
            },
            encoding: null,
            transform: buffer => Image.deserializeBinary(
                toUint8Array(buffer)
            ),
            transform2xxOnly: true,
            timeout: 5000
        });
    }

    /** Start the sync loop in the background. */
    async start() {
        this._active = true;
        this._runLoop();
    }

    /** Set a flag to kill the sync loop. */
    async stop() {
        // FIXME: There's technically a problem here if the loop is
        // stopped and immedatiately started again. Two loops would
        // be created in this case.
        this._active = false;
    }
}
