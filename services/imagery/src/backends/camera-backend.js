import { GPhoto2 } from 'gphoto2';
import request from 'request-promise-native';

import { CameraTelem } from '../messages/telemetry_pb';
import { Image } from '../messages/imagery_pb';

import { toUint8Array, removeExif, wait } from '../util';

export default class CameraBackend {
    /** Create a new camera backend. */
    constructor(imageStore, interval, telemUrl) {
        this._imageStore = imageStore;
        this._interval = interval;
        this._telemUrl = telemUrl;
        this._active = false;

        this._gphoto2 = new GPhoto2();
    }

    /** Continuously take photos. */
    async _runLoop(camera) {
        while (this._active) {
            let startTime = (new Date()).getTime() / 1000;

            let photo;
            let metadataPromise = this._getMeta();

            try {
                photo = await this._takePhoto(camera);
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

            // Register the photo in the background (no await). Note
            // that this allows the telemetry to be collected if it
            // takes longer than the photo, and doesn't prevent the
            // next photo from being taken if the telemetry still
            // hasn't been received yet.
            this._registerPhoto(photo, metadataPromise)
                .catch((err) => {
                    let message = err.name + ': ' + err.message;
                    console.error('Error while registering photo: ' + message);
                });

            let endTime = (new Date()).getTime() / 1000;

            // If we haven't hit the interval time yet, wait some
            // more time.
            let duration = endTime - startTime;

            if (duration < this._interval) {
                await wait((this._interval - duration) * 1000);
            }
        }
    }

    /** Get the metadata for the image. */
    async _getMeta() {
        let metadata = new Image();

        // By default, we'll always list the current time.
        metadata.setTime((new Date()).getTime() / 1000);

        // If a telemetry service url was given, we'll try requesting
        // the latest camera telemetry. If it works, then we'll add
        // it to the metadata.
        if (!!this._telemUrl) {
            try {
                let telem = await this._getCameraTelem();

                // FIXME: since we don't have gimbal data we'll just
                //        have to assume that the camera is pointed
                //        straight down.
                telem.setRoll(0);
                telem.setPitch(0);

                metadata.setHasTelem(true);
                metadata.setTelem(telem);
            } catch (err) {
                let message = err.name + ': ' + err.message;
                console.error('Error while requesting telemetry: ' + message);
            }
        }

        return metadata;
    }

    /** Request the latest camera telemetry. */
    async _getCameraTelem() {
        return await request({
            uri: `http://${this._telemUrl}/api/camera-telem`,
            encoding: null,
            transform: buffer => CameraTelem.deserializeBinary(
                toUint8Array(buffer)
            ),
            transform2xxOnly: true,
            // The timeout is short because telemetry data loses it's
            // relevance quickly while the plane is flying.
            timeout: 1500
        });
    }

    /** Take a photo and return the data. */
    async _takePhoto(camera) {
        let photo = await (new Promise((resolve, reject) => {
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

        // Taking off EXIF data to prevent image preview applications
        // from rotating it.
        return await removeExif(photo);
    }

    /** Add the photo with the metadata to the image store. */
    async _registerPhoto(photo, metadataPromise) {
        await this._imageStore.addImage(photo, await metadataPromise);
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
