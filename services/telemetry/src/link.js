import queue from 'async/queue';
import series from 'async/series';
import path from 'path';

import { telemetry } from './messages';

import MavlinkSocket from './mavlink-socket';
import { receiveMission, sendMission, sendMissionCurrent } from './mission';
import PlaneState from './state';
import { wrapIndex } from './util';

// Parse CXN_STR (defined in Docker config)
// Capture group 0: IP address (IPv4, IPv6, and hostname are all acceptable)
// Capture group 1: port
if (typeof(process.env['CXN_STR']) === 'undefined') {
    throw Error('CXN_STR environment variable missing');
}
const mavHost = /(?:udpout:)?(.+):(\d+)/.exec(process.env['CXN_STR']);
const destAddr = mavHost[1];
const destPort = parseInt(mavHost[2]);

const ConnectionState = Object.freeze({
    NOT_CONNECTED: Symbol('not_connected'),
    IDLE:          Symbol('idle'),
    READING:       Symbol('reading'),
    WRITING:       Symbol('writing')
});

export default class PlaneLink {
    constructor() {
        this._mav = new MavlinkSocket(destAddr, destPort);
        this.state = new PlaneState();
        this._cxnState = ConnectionState.NOT_CONNECTED;

        // Async transaction queue. This only allows one transaction
        // to be active at a time.
        this._taskQueue = queue(async (asyncTask) => {
            return await asyncTask();
        }, 1);

        // Will be assigned once missions are received.
        this._currentMissionItem = null;
    }
    
    /**
     * Sets up a UDP socket and establishes a connection to
     * the plane.
     */
    async connect() {
        await new Promise((resolve, reject) => {
            const unboundTasks = [
                function(cb) {
                    this._mav.connect()
                        .then(() => cb())
                        .catch(err => cb(err));
                },
                function(cb) {
                    this._bindMessages({
                        'resolve': resolve,
                        'reject': reject
                    });
                    cb();
                },
                function(cb) {
                    this._connect_timeout = setInterval(
                        () => this._start_telemetry(), 1500
                    );
                    cb();
                    // Then we wait for the promise to be resolved
                    // on receiving the first message...
                }
            ];
            let boundTasks = [];
            unboundTasks.forEach(func => boundTasks.push(func.bind(this)), this);
            series(boundTasks, (err) => {
                if (err) {
                    reject(err);
                }
            });
        });
    }

    /**
     * Waits for event queue to stop, and closes the UDP socket.
     */
    async disconnect() {
        await new Promise((resolve, reject) => {
            if (this._taskQueue.idle()) {
                // Cleanup immediately if idle
                this._cleanup();
                resolve();
            } else {
                // Wait 10 seconds for the queue to clear up.
                // Force cleanup after time has elapsed.
                const timeout = setTimeout(() => {
                    console.warn('Timed out waiting on task queue. Killing queue.');
                    this._taskQueue.kill();
                    this._cleanup();
                    resolve();
                }, 10000);
                this._taskQueue.drain = () => {
                    clearTimeout(timeout);
                    this._cleanup();
                    resolve();
                };
            }
        });
    }

    async _cleanup() {
        await this._mav.close();
    }

    /**
     * Get the raw mission from the plane.
     *
     * @returns {Promise<telemetry.RawMission>}
     */
    async getRawMission() {
        return await this._execTransaction(async () => {
            this._cxnState = ConnectionState.READING;

            try {
                return await receiveMission(this._mav);
            } finally {
                this._cxnState = ConnectionState.IDLE;
            }
        });
    }

    /**
     * Send a raw mission to the plane.
     *
     * @param {telemetry.RawMission} mission
     * @returns {Promise}
     */
    async setRawMission(mission) {
        await this._execTransaction(async () => {
            this._cxnState = ConnectionState.WRITING;

            try {
                await sendMission(this._mav, mission);
            } finally {
                this._cxnState = ConnectionState.IDLE;
            }
        });
    }

    /**
     * Get the current mission item.
     *
     * If the mission item has already be received. It is loaded from
     * a cached value.
     *
     * @returns {Promise<telemetry.MissionCurrent>}
     */
    async getMissionCurrent() {
        // If the current mission item hasn't been set, then get the
        // mission. The mission item will be set as a side effect.
        if (this._currentMissionItem === null) {
            await this.getMission();
        }

        return telemetry.MissionCurrent.create({
            time: Date.now() / 1000,
            item_number: this._currentMissionItem || 0
        });
    }

    /**
     * Set the current mission item.
     *
     * @param {telemetry.MissionCurrent} missionCurrent
     * @returns {Promise}
     */
    async setMissionCurrent(missionCurrent) {
        await this._execTransaction(async () => {
            this._cxnState = ConnectionState.WRITING;

            try {
                await sendMissionCurrent(this._mav, missionCurrent);
            } finally {
                this._cxnState = ConnectionState.IDLE;
            }
        });
    }

    // Add an async task to the queue.
    async _execTransaction(asyncTask) {
        return await new Promise((resolve, reject) => {
            this._taskQueue.push(asyncTask, (err, result) => {
                if (err) reject(err);
                else resolve(result);
            });
        });
    }

    _connectSuccess(connectPromiseDecision) {
        if (this._cxnState === ConnectionState.NOT_CONNECTED) {
            console.log('Link: Connection established to plane');

            connectPromiseDecision.resolve();
            this._cxnState = ConnectionState.IDLE;

            clearInterval(this._connect_timeout);
            delete this._connect_timeout;
        }
    }

    _bindMessages(connectPromiseDecision) {
        const mav = this._mav;

        mav.on('MISSION_CURRENT', (fields) => {
            this._currentMissionItem = fields.seq;
        });
        mav.on('MISSION_ITEM', (fields) => {
            if (fields.current) {
                this._currentMissionItem = fields.seq;
            }
        });
        mav.on('GLOBAL_POSITION_INT', (fields) => {
            const s = this.state;
            s.lat = fields.lat / 1e7;
            s.lon = fields.lon / 1e7;
            s.altMSL = fields.alt / 1000;
            s.altAGL = fields.relative_alt / 1000;
            s.yaw = fields.hdg / 100;
            this._connectSuccess(connectPromiseDecision);
        });
        mav.on('HEARTBEAT', (msg, fields) => {
            const s = this.state;
            s.mode = String(s.custom_mode);
        });
        mav.on('ATTITUDE', (fields) => {
            const s = this.state;
            s.roll = fields.roll * 180 / Math.PI;
            s.pitch = fields.pitch * 180 / Math.PI;
            s.yaw = wrapIndex(fields.yaw * 180 / Math.PI, 360);
        });
        mav.on('VFR_HUD', (fields) => {
            const s = this.state;
            s.airspeed = fields.airspeed;
            s.groundSpeed = fields.groundspeed;
            s.altMSL = fields.alt;
        });
        mav.on('BATTERY_INFO', (fields) => {
            const s = this.state;
            Object.assign(s.battery, {
                temp: fields.temperature,
                voltages: fields.voltages,
                current: fields.current_battery,
                currentSpent: fields.current_consumed,
                percentage: fields.battery_remaining,
                approxTime: fields.time_remaining
            });
        })
    }

    async _start_telemetry() {
        await this._mav.send('REQUEST_DATA_STREAM', {
            target_system: 1,
            target_component: 1,
            req_stream_id: 0,
            req_message_rate: 5,
            start_stop: 1
        });
    }
}
