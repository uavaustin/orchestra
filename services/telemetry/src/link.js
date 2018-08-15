import queue from 'async/queue';
import series from 'async/series';
import winston from 'winston';
import path from 'path';

import { telemetry } from './messages';

import MavlinkSocket from './mavlink-socket';
import { receiveMission, sendMission } from './mission';
import PlaneState from './state';
import { wrapIndex } from './util';

const missionLogger = winston.createLogger({
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, '..', 'missions-received.txt'),
            timestamp: true
        })
    ]
});

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
        this._taskQueue = queue((task, cb) => {task(); cb();});

        // Will be assigned once missions are received
        this._curWaypoint = null;
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
     * Performs a mission list request if one is not already underway.
     * @returns {telemetry.RawMission}
     */
    async requestMission() {
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
     * Sends mission data to the plane.
     * @param {telemetry.RawMission} mission
     */
    async sendMission(mission) {
        return await this._execTransaction(async () => {
            this._cxnState = ConnectionState.WRITING;

            try {
                await sendMission(this._mav, mission);
            } finally {
                this._cxnState = ConnectionState.IDLE;
            }
        });
    }

    // Add an async task to the queue.
    async _execTransaction(asyncTask) {
        return await new Promise((resolve, reject) => {
            this._taskQueue.push(() => {
                asyncTask().then(resolve).catch(reject);
            });
        });
    }

    /**
     * Gets the current waypoint.
     * If the current waypoint is not known, get the plane's missions.
     * Returns null if no missions.
     * 
     * @returns index of the current waypoint, or null if plane has no
     * missions
     */
    async getCurrentWaypoint() {
        if (this._curWaypoint === null) {
            await this.requestMission();
        }
        return this._curWaypoint;
    }

    /**
     * Sets the current waypoint.
     * This method blocks until we have received a MISSION_CURRENT
     * packet back.
     */
    async setCurrentWaypoint(seq) {
        return await new Promise((resolve, reject) => {
            this._taskQueue.push(async () => {
                this._curWaypointPromise = {
                    'resolve': resolve,
                    'reject': reject
                };
                this._cxnState = ConnectionState.WRITING;
                this._sendSetCurrentWaypoint(seq);

                const timeout = setTimeout(() => {
                    reject('timeout waiting for MISSION_CURRENT');
                }, 2000);
                await this._curWaypointPromise;
                clearTimeout(timeout);

                delete this._curWaypointPromise;
                this._cxnState = ConnectionState.IDLE;
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

        mav.on('MISSION_CURRENT', (fields) => this._handleCurrentWaypoint(fields));
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

    _handleCurrentWaypoint(fields) {
        if (this._curWaypoint !== fields.seq) {
            console.log(`Link: Plane reports that it is now on waypoint ${fields.seq}`);
        }
        this._curWaypoint = fields.seq;
        if (typeof this._curWaypointPromise !== 'undefined') {
            this._curWaypointPromise.resolve(fields.seq);
        }
    }

    async _sendSetCurrentWaypoint(seq) {
        await this._mav.send('MISSION_SET_CURRENT', {
            target_system: 1,
            target_component: 1,
            seq: seq
        });
    }
}
