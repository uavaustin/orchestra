import path from 'path';

import chokidar from 'chokidar';
import fs from 'fs-extra';

import { Image } from '../messages/imagery_pb';

const WATCH_FOLDER_NAME = '/opt/new-images';

export default class FileBackend {
    /**
     * Simple backend which watches a folder for new images.
     *
     * This backend is mostly useful for testing, as no camera is
     * required for use.
     *
     * Because of a potential time delay between when the image was
     * placed in the folder and when it was seen, telemetry is not
     * retrieved.
     */

    /** Create a new file backend. */
    constructor(imageStore) {
        this._watch(imageStore);
    }

    /** Watches a folder and adds new images to the image store. */
    async _watch(imageStore) {
        // Creates an empty directory to watch if it doesn't exist.
        await fs.mkdirp(WATCH_FOLDER_NAME);

        chokidar.watch(WATCH_FOLDER_NAME)
            .on('add', async (path) => {
                // On each new file, read and then delete it.
                let data = await fs.readFile(path, { encoding: null });
                await fs.unlink(path);

                // The only metadata here is the timestamp.
                let metadata = new Image();

                metadata.setTime((new Date()).getTime() / 1000);

                // Add it to the image store without a warped image.
                await imageStore.addImage(data, metadata);
            });
    }
}
