import EventEmitter from 'events';
import path from 'path';

import fs from 'fs-extra';
import { sprintf } from 'sprintf-js';

import { imagery } from './messages';

const FOLDER_NAME = '/opt/imagery';
const COUNT_FILE = path.join(FOLDER_NAME, 'count.json');

export default class ImageStore extends EventEmitter {
  /**
   * Stores images in a folder so they can accessed at will.
   *
   * After creating an object, setup() needs to be called so it can
   * get the folder ready.
   *
   * Image metadata is stored as JSON. A file called count.json holds
   * the number of the images taken, so when the image stores starts
   * with an existing directory, it can use the previous images.
   *
   * The rate at which images are added is also stored. Note that
   * this does not take in consideration the timestamp of the images.
   */

  /** Create a new image store. */
  constructor(clearExisting = false) {
    super();

    this._clearExisting = clearExisting;
    this._count = 0;

    // The time of the last images in the store.
    this._times = [];
  }

  /** Creates an empty directory for the image store if needed. */
  async setup() {
    if (this._clearExisting === true) {
      await fs.emptyDir(FOLDER_NAME);
    } else if (await fs.exists(COUNT_FILE)) {
      // Reading the file and getting the count from there.
      this._count = JSON.parse(await fs.readFile(COUNT_FILE)).count;
    } else {
      // If there isn't a count file, we'll make sure this directory
      // exists.
      await fs.mkdirp(FOLDER_NAME);
    }
  }

  /** Get the number of images stored. */
  getCount() {
    return this._count;
  }

  /**
   * Feed an image into the image store.
   *
   * The metadata attached is the Image proto message without the
   * images included.
   *
   * Returns the id number for the image (the first one is 0).
   *
   * @param  {Buffer}        image
   * @param  {imagery.Image} metadata
   * @return {Promise.<number>} The id number for the image.
   */
  async addImage(image, metadata) {
    const id = this._count;

    // Set the id number in the metadata.
    metadata.id = id;

    await this.setImage(id, image);
    await this.setMetadata(id, metadata);

    // Recording the count in case the image store restarts.
    await fs.writeFile(COUNT_FILE, JSON.stringify(
      { count: id + 1 }, null, 2
    ));

    // Adding this to the list for rate calculations.
    this._recordImageTime();

    // The count in incremented towards the end, to prevent image
    // requests while still writing them.
    this._count++;

    // Broadcast the new image id.
    this.emit('image', id);

    return id;
  }

  /** Return the image for the id. */
  async getImage(id) {
    let filename = this._formatFilename(id);

    return await fs.readFile(filename, { encoding: null });
  }

  /** Write the image to a file. */
  async setImage(id, image) {
    let filename = this._formatFilename(id);

    await fs.writeFile(filename, image, { encoding: null });
  }

  /** Get the image metadata in the Image protobuf message. */
  async getMetadata(id) {
    const filename = this._formatMetadataFilename(id);

    const contents = await fs.readFile(filename);

    return imagery.Image.fromObject(JSON.parse(contents));
  }

  /** Write the image metadata to a file. */
  async setMetadata(id, metadata) {
    const filename = this._formatMetadataFilename(id);

    const contents = JSON.stringify(
      metadata.constructor.toObject(metadata), null, 2
    );

    await fs.writeFile(filename, contents);
  }

  /** Get the filename for an image by id. */
  _formatFilename(id) {
    const basename = sprintf('image-%06d.jpg', id);

    return path.join(FOLDER_NAME, basename);
  }

  /** Get the filename for image metadata by id. */
  _formatMetadataFilename(id) {
    let basename = sprintf('meta-%06d.json', id);

    return path.join(FOLDER_NAME, basename);
  }

  /** Get the rate that images are being added. */
  getRate() {
    this._trimTimeArray();
    return this._times.length / 5;
  }

  /** Add an image timestamp to the list. **/
  _recordImageTime() {
    this._times.push((new Date()).getTime() / 1000);
    this._trimTimeArray();
  }

  /** Remove timestamps out of the 5 second period. */
  _trimTimeArray() {
    const threshold = (new Date()).getTime() / 1000 - 5;

    // Removing old times until there are none for 5 sec.
    while (this._times[0] < threshold) {
      this._times.shift();
    }
  }
}
