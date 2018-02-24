import EventEmitter from 'events';
import path from 'path';

import fs from 'fs-extra';
import { sprintf } from 'sprintf-js';

import { Image } from './messages/imagery_pb';

import { toUint8Array } from './util';

const FOLDER_NAME = '/opt/imagery';

export default class ImageStore extends EventEmitter {
    /**
     * Stores images in a folder so they can accessed at will.
     *
     * After creating an object, setup() needs to be called so it can
     * get the folder ready.
     *
     * Image metadata is also stored in a json file with the images
     * as well.
     */

    /** Create a new image store. */
    constructor() {
        super();

        this._count = 0;
    }

    /** Creates an empty directory for the image store. */
    async setup() {
        await fs.emptyDir(FOLDER_NAME);
    }

    /** Get the number of images stored. */
    getCount() {
        return this._count;
    }

    /**
     * Feed an image into the image store.
     *
     * If a warped image is also available it can be passed as well.
     *
     * The metadata attached is the Image proto message without the
     * images included.
     *
     * Returns the id number for the image (the first one is 0).
     *
     * @param  {Buffer}      image
     * @param  {Buffer}      [warped]
     * @param  {Image}       metadata
     * @return {Promise.<number>} The id number for the image.
     */
    async addImage(image, warped, metadata) {
        if (arguments.length == 2) {
            metadata = warped;
            warped = undefined;
        }

        let id = this._count;
        this._count++;

        let filenameNormal = this._formatFilename(id);
        let filenameWarped = this._formatFilename(id, true);
        let filenameMeta = this._formatMetadataFilename(id);

        await fs.writeFile(filenameNormal, image, {
            encoding: null
        });

        if (warped !== undefined)
            await fs.writeFile(filenameWarped, warped, {
                encoding: null
            });

        await fs.writeFile(filenameMeta, metadata.serializeBinary(), {
            encoding: null
        });

        // Broadcast the new image id.
        this.emit('image', id);

        return id;
    }

    /** Return the image for the id in an Uint8Array. */
    async getImage(id, warped = false) {
        let filename = this._formatFilename(id, warped);

        let buffer = await fs.readFile(filename, {
            encoding: null
        });

        return toUint8Array(buffer);
    }

    /** Get the image metadata in the Image protobuf message. */
    async getMetadata(id) {
        let filename = this._formatMetadataFilename(id);

        let buffer = await fs.readFile(filename, {
            encoding: null
        });

        return Image.deserializeBinary(toUint8Array(buffer));
    }

    /** Get the filename for an image id. */
    _formatFilename(id, warped = false) {
        let basename;

        if (warped) {
            basename = sprintf('%06d-warped.png', id);
        } else {
            basename = sprintf('%06d.png', id);
        }

        return path.join(FOLDER_NAME, basename);
    }

    /** Get the filename for image metadata by image id. */
    _formatMetadataFilename(id) {
        let basename = sprintf('%06d-metadata.pb', id);

        return path.join(FOLDER_NAME, basename);
    }
}
