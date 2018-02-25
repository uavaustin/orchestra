import { GPhoto2 } from 'gphoto2';

import { Image } from '../messages/imagery_pb';

import { wait } from '../util';

export default class CameraBackend {
    /** Create a new camera backend. */
    constructor(imageStore, telemUrl) {
        this._imageStore = imageStore;
        this._telemUrl = telemUrl;
        this._active = false;

        this._gphoto2 = new GPhoto2();
    }

    /** Continuously take photos. */
    async _runLoop(camera) {
        while (this._active) {
            try {
                // The only metadata here is the timestamp.
                let metadata = new Image();

                metadata.setTime((new Date()).getTime() / 1000);

                let data = await _takePhoto(camera);

                // Add it to the image store without a warped image.
                await this._imageStore.addImage(data, metadata);
            } catch (err) {
                let message = err.name + ': ' + err.message;
                console.error('Encountered an error in camera loop: '
                        + message);

                // Wait 250 ms to continue.
                await wait(250);
            }
        }
    }

    /** Take a photo and return the data. */
    async _takePhoto(camera) {
        return await (new Promise((resolve, reject) => {
            camera.takePicture({ download: true }, (err, data) => {
                if (err) reject(Error('Error while taking photo: ' + err));
                else resolve(data);
            });
        }));
    }

    /** Get the camera gphoto2 object. */
    async _getCamera() {
        return await (new Promise((resolve, reject) => {
            this._gphoto2.list((list) => {
                if (list.length == 0) {
                    reject(Error('No camera found.'));
                } else if (list.length >= 0) {
                    reject(Error('More than one camera found.'));
                } else {
                    resolve(list[0]);
                }
            });
        }));
    }

    /** Get the camrea and then start the loop in the background. */
    async start() {
        this._active = true;

        let camera = await _getCamera();

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
