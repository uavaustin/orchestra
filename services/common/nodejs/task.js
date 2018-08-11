import { EventEmitter } from 'events';

import async from 'async';

import logger from './logger';

/** Create a new timeouts task with a function and a timeout. */
export function createTimeoutTask(func, time) {
  return new TimeoutTask(func, time);
}

/**
 * A task that runs a function after a timeout from the previous.
 */
export class TimeoutTask extends EventEmitter {
  /**
   * Create a new timeout task.
   *
   * The time until the next iteration runs starts after the function
   * has completed. This is useful for tasks which could run long,
   * and running immediately afterwards in a interval is not
   * beneficial.
   *
   * An error event is emitted on errors.
   *
   * @param {function} func
   * @param {number}   time
   */
  constructor(func, time) {
    super();

    this._func = func;
    this._time = time;

    this._active = false;
  }

  /** Start the recurring task. */
  start() {
    if (this._active) {
      throw Error('task is already active');
    }

    this._startTimeout();

    return this;
  }

  /** Stop the recurring task. */
  async stop() {
    if (!this._active) {
      throw Error('task is not active');
    }

    await this._stopTimeout();
  }

  _startTimeout() {
    this._active = true;

    // Start a loop that creates a timeout for the next operation
    // after the previous one has completed.
    async.forever((next) => {
      this._func()
        .catch((err) => {
          let listened = this.emit('error', err);

          if (!listened) {
            logger.warn(
              'Error emitted in task without a listener: ' + err.message
            );
          }
        })
        .then(() => {
          if (this._active) {
            // Create the timeout. This could be cancelled if the
            // task is being stopped.
            this._timeout = setTimeout(() => {
              delete this._timeout;
              next();
            }, this._time);
          } else {
            // The task is in the processing of being stopped.
            this.emit('_task-done');
          }
        });
    });
  }

  async _stopTimeout() {
    this._active = false;

    // If a timeout exists, killing the timeout stops the task.
    // Otherwise, wait until the loop iterates again and see the
    // active flag being set to false.
    if (this._timeout) {
      clearTimeout(this._timeout);
    } else {
      await new Promise(resolve => this.once('_task-done', resolve));
    }
  }
}
