import EventEmitter from 'events';
import path from 'path';

import fs from 'fs-extra';
import { sprintf } from 'sprintf-js';

import sqlite from 'sqlite';
import genericPool from 'generic-pool';

import { imagery } from './messages';
import logger from './common/logger';

const FOLDER_NAME = '/opt/imagery';
const DB_FILE = path.join(FOLDER_NAME, 'images.sqlite3');

export default class ImageStore extends EventEmitter {
  /**
   * Stores images in a folder so they can accessed at will.
   *
   * After creating an object, setup() needs to be called so it can
   * get the folder ready.
   *
   * Image metadata is stored as JSON. A SQLite database holds
   * a list of the images taken, so when the image stores starts
   * with an existing directory, it can use the previous images.
   *
   * The rate at which images are added is also stored. Note that
   * this does not take in consideration the timestamp of the images.
   *
   * A limit can be placed on the maximum number of images stored by
   * setting the maxImages parameter. When the limit is reached,
   * the store will begin deleting old images.
   */

  /** Create a new image store. */
  constructor(clearExisting = false, maxImages = undefined) {
    super();

    this._clearExisting = clearExisting;
    this._maxImages = maxImages;

    // The time of the last images in the store.
    this._times = [];

    this._dbPool = null;

    this._cleared = false;
  }

  /** Creates an empty directory for the image store if needed. */
  async setup() {
    if (this._clearExisting) {
      await fs.emptyDir(FOLDER_NAME);
    }

    // If there isn't a database file, we'll make sure this
    // directory exists.
    await fs.mkdirp(FOLDER_NAME);

    // A connection pool prevents database queries from intefering
    // with each other while a transaction is occurring. Instead,
    // connections will wait on each others' transactions to finish
    // before proceeding execution or starting another transaction.
    this._dbPool = genericPool.createPool({
      create: async () => {
        const db = await sqlite.open(DB_FILE);
        db.configure('busyTimeout', 3000);
        return db;
      },
      destroy: (db) => db.close()
    }, { max: 1, min: 0 });

    await this._withDb(async (db) => {
      await db.run('CREATE TABLE IF NOT EXISTS ' +
        'images(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
               'deleted BOOLEAN DEFAULT FALSE)');
    });
  }

  /**
   * Allows operations on the image store database, automatically
   * acquiring and releasing a database connection, and optionally
   * wrapping it with a transaction such that it automatically
   * aborts on any unhandled exception.
   * @param {function(db)} fn Function that contains a database
   * connection
   * @param {boolean} transaction Whether or not database operations
   * should be wrapped in a transaction
   */
  async _withDb(fn, transaction = false) {
    const db = await this._dbPool.acquire();

    // This should only error if the busy timeout is exceeded.
    if (transaction) {
      await db.exec('BEGIN IMMEDIATE TRANSACTION');
    }

    try {
      const retval = await fn(db);

      if (transaction) {
        await db.exec('COMMIT');
      }

      return retval;
    } catch (e) {
      if (transaction) {
        await db.exec('ROLLBACK');
      }

      throw e;
    } finally {
      this._dbPool.release(db);
    }
  }

  /** Get the number of images stored. */
  async getCount() {
    return (await this._withDb(async (db) => await db.get(
      'SELECT COUNT(id) FROM images WHERE NOT deleted'
    )))['COUNT(id)'];
  }

  /** Get a list of image IDs available for retrieval. */
  async getAvailable() {
    return (await this._withDb(async (db) => await db.all(
      'SELECT id FROM images WHERE NOT deleted ORDER BY id ASC'
    ))).map(row => row.id);
  }

  /** Get the ID of the last image stored. */
  async getLatestId() {
    return (await this._withDb(async (db) => await db.get(
      'SELECT id FROM images WHERE NOT deleted ORDER BY id DESC LIMIT 1'
    )))['id'];
  }

  /**
   * Return whether or not an image ID exists (regardless of
   * whether or not it was deleted).
   */
  async exists(id) {
    // Please watch out if future versions of sqlite
    // change the return value to null, which is a more
    // correct return type than undefined. To defend
    // myself from this, I have used a `!=` instead of
    // a `!==`.
    return (await this._withDb(async (db) => await db.get(
      'SELECT id FROM images WHERE id = ?', id
    ))) != undefined;
  }

  /** Return whether or not an image is marked as deleted. */
  async deleted(id) {
    const row = await this._withDb(async (db) => await db.get(
      'SELECT deleted FROM images WHERE id = ?', id
    ));

    if (row === null) {
      throw Error(`image ${id} does not exist`);
    }

    return row['deleted'] === 1;
  }

  /**
   * Feed an image into the image store.
   *
   * The metadata attached is the Image proto message without the
   * images included.
   *
   * Returns the id number for the image (the first one is 1).
   *
   * @param  {Buffer}        image
   * @param  {imagery.Image} metadata
   * @param  {number}        id
   * @return {Promise.<number>} The id number for the image.
   */
  async addImage(image, metadata, id = undefined) {
    // This is a transaction, so it only allows one image at a time
    // to be added to the database.
    await this._withDb(async (db) => {
      if (id === undefined) {
        id = (await db.run('INSERT INTO images DEFAULT VALUES')).lastID;
      } else {
        await db.run('INSERT INTO images(id) VALUES (?)', id);
      }

      // Set the id number in the metadata.
      metadata.id = id;

      await this.setImage(id, image);
      await this.setMetadata(id, metadata);

      // Adding this to the list for rate calculations.
      this._recordImageTime();

      // Broadcast the new image id.
      this.emit('image', id);
    }, true);

    await this.purgeImages();

    return id;
  }

  /**
   * Delete a single image from the image store and mark it as
   * deleted.
   * @param {number} id
   * @param {sqlite.Database} transaction Database connection that
   * is currently undergoing a transaction
   */
  async deleteImage(id, transaction = undefined) {
    const markDeleted = async (db) => {
      await db.run('UPDATE images SET deleted = TRUE WHERE id = ?', id);
    };

    if (transaction)
      markDeleted(transaction);
    else
      await this._withDb(markDeleted, true);

    try {
      await this.removeImage(id);
      await this.removeMetadata(id);
    } catch (e) {
      // FS errors should not stop the whole transaction, especially
      // if someone decided to monkey around and accidentally delete
      // an image.
      logger.warn(`Problem deleting image ${id} from file system:`, e);
    }
  }

  /** Remove old images such that the image store is no longer
      above the limit. */
  async purgeImages() {
    if (!this._maxImages) return;

    await this._withDb(async (db) => {
      // We cannot use this.getCount because it uses a new connection
      // from the connection pool, so it will not work while we are
      // performing a transaction.
      let getCount = async () => (await db.get(
        'SELECT COUNT(id) FROM images WHERE NOT DELETED'
      ))['COUNT(id)'];

      while (await getCount() > this._maxImages) {
        let id = (await db.get(
          'SELECT id FROM images WHERE NOT DELETED ORDER BY id ASC'
        ))['id'];

        this.deleteImage(id, db);
      }
    }, true);
  }

  /** CLears all images by removing the directory. */
  async clearImages() {
    if (this._cleared)
      return;

    this._cleared = true;
    // Wait for all resources to be drained
    await this._dbPool.drain();
    this._dbPool.clear();

    await fs.remove(FOLDER_NAME);
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

  /** Delete an image from the file system. */
  async removeImage(id) {
    let filename = this._formatFilename(id);

    await fs.unlink(filename);
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

  /** Delete a metadata file from the file system. */
  async removeMetadata(id) {
    let filename = this._formatMetadataFilename(id);

    await fs.unlink(filename);
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
