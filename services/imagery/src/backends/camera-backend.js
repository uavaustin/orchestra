import { GPhoto2 } from 'gphoto2';

import { Image } from '../messages/imagery_pb';

import { removeExif, wait } from '../util';

export default class CameraBackend {
    /** Create a new camera backend. */
    constructor(imageStore, interval) {
        this._imageStore = imageStore;
        this._interval = interval;
        this._active = false;

        this._gphoto2 = new GPhoto2();
    }

    /** Continuously take photos. */
    async _runLoop(camera) {
        while (this._active) {
            let startTime = (new Date()).getTime() / 1000;

            // The only metadata here is the timestamp.
            let metadata = new Image();

            metadata.setTime(startTime);

            try {
                let data = await this._takePhoto(camera);

                // Taking off EXIF data to prevent image preview
                // applications from rotating it.
                data = await removeExif(data);

                // Add it to the image store.
                await this._imageStore.addImage(data, metadata);
            } catch (err) {
                let message = err.name + ': ' + err.message;
                console.error('Encountered an error in camera loop: '
                        + message);

                // If we have an error, we'll wait for a little to
                // prevent these errors from happening too rapidly
                // and then continue;
                await wait(250);
                continue;
            }

            let endTime = (new Date()).getTime() / 1000;

            // If we haven't hit the interval time yet, wait some
            // more time.
            let duration = endTime - startTime;

            if (duration < this._interval) {
                await wait((this._interval - duration) * 1000);
            }
        }
    }

    /** Take a photo and return the data. */
    async _takePhoto(camera) {
        return await (new Promise((resolve, reject) => {
            camera.takePicture({ download: true }, (err, data) => {
                if (err) {
                    reject(Error('Error while taking photo: ' + err));
                } else if (!data) {
                    reject(Error('Image was empty'));
                } else {
                    resolve(data);
                }
            });
        }));
    }

    /** Get the camera gphoto2 object. */
    async _getCamera() {
        return await (new Promise((resolve) => {
            this._gphoto2.list((list) => {
                if (list.length == 0) {
                    console.error('No camera found.');
                    process.exit(1);
                } else if (list.length >= 2) {
                    console.error('More than 1 camera found.');
                    process.exit(1);
                } else {
                    resolve(list[0]);
                }
            });
        }));
    }

    /** Get the camrea and then start the loop in the background. */
    async start() {
        this._active = true;

        let camera = await this._getCamera();

        this._runLoop(camera);
    }

    /** Set a flag to kill the camera loop. */
    async stop() {
        // FIXME: There's technically a problem here if the loop is
        // stopped and immedatiately started again. Two loops would
        // be created in this case.
        this._active = false;
    }
}
