import { exec } from 'child_process';
import { promisify } from 'util';

import request from 'request-promise-native';

import { imagery, telemetry } from '../messages';

import { removeExif, wait } from '../util';

const execAsync = promisify(exec);

export default class CameraBackend {
    /** Create a new camera backend. */
    constructor(imageStore, interval, telemUrl) {
        this._imageStore = imageStore;
        this._interval = interval;
        this._telemUrl = telemUrl;
        this._active = false;
    }

    /** Continuously take photos. */
    async _runLoop() {
        while (this._active) {
            let startTime = (new Date()).getTime() / 1000;

            let photo;
            let metadataPromise = this._getMeta();

            try {
                photo = await this._takePhoto();
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
        // By default, we'll always list the current time.
        let metadata = imagery.Image.create({
            time: (new Date()).getTime() / 1000
        });

        // If a telemetry service url was given, we'll try requesting
        // the latest camera telemetry. If it works, then we'll add
        // it to the metadata.
        if (!!this._telemUrl) {
            try {
                let telem = await this._getCameraTelem();

                // FIXME: since we don't have gimbal data we'll just
                //        have to assume that the camera is pointed
                //        straight down.
                telem.roll = 0;
                telem.pitch = 0;

                metadata.has_telem = true;
                metadata.telem = telem;
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
            transform: buffer => telemetry.CameraTelem.decode(buffer),
            transform2xxOnly: true,
            // The timeout is short because telemetry data loses it's
            // relevance quickly while the plane is flying.
            timeout: 1500
        });
    }

    /** Take a photo and return the data. */
    async _takePhoto() {
        let { stdout, stderr } = await exec(
             'gphoto2 --capture-image-and-download --no-keep --stdout',
             {
                encoding: 'buffer',
                timeout: 5000
             }
        );

        let photo = stdout;

        // Taking off EXIF data to prevent image preview applications
        // from rotating it.
        return await removeExif(photo);
    }

    /** Add the photo with the metadata to the image store. */
    async _registerPhoto(photo, metadataPromise) {
        await this._imageStore.addImage(photo, await metadataPromise);
    }

    /** Get the camrea and then start the loop in the background. */
    async start() {
        this._active = true;

        this._runLoop();
    }

    /** Set a flag to kill the camera loop. */
    async stop() {
        // FIXME: There's technically a problem here if the loop is
        // stopped and immedatiately started again. Two loops would
        // be created in this case.
        this._active = false;
    }
}
