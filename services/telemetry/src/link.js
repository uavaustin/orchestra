import mavlink from 'mavlink';
import dgram from 'dgram';
import queue from 'async/queue';
import series from 'async/series';

import { telemetry } from './messages';
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
        this._mav = new mavlink(1, 1);
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
                    console.log('Establishing mavlink...');
                    this._mav.on('ready', () => cb());
                },
                function(cb) {
                    console.log('Creating socket...');
                    const socket = dgram.createSocket('udp4');
                    this._socket = socket;
                    socket.on('error', (err) => {
                        console.error('Socket connection error! ', err);
                    });
                    socket.on('listening', () => cb());
                    socket.bind(25565);
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
     * Performs a mission list request if one is not already underway.
     * @returns {Array} an array of waypoints that were received
     */
    async requestMissions() {
        if (typeof(this._missionPromise) === 'undefined') {
            this._missionPromise = new Promise((resolve, reject) => {
                this._missionPromiseDecision = {
                    'resolve': resolve,
                    'reject': reject
                };
            });
            this._taskQueue.push(async () => {
                this._cxnState = ConnectionState.READING;
                this._setupMissionRequest();
                await this._missionPromise;
                this._sendMissionListAck();
                this._cxnState = ConnectionState.IDLE;
            });
        }
        return await this._missionPromise;
    }

    /**
     * Sends mission data to the plane.
     * @param {Array} mission an array of waypoints to send
     */
    async sendMission(mission) {
        return await new Promise((resolve, reject) => {
            this._taskQueue.push(async () => {
                this._cxnState = ConnectionState.WRITING;
                this._missionSender = new MissionSender(this._mav, this._socket, mission, resolve, reject);
                await this._missionSender.send();
                delete this._missionSender;
                this._cxnState = ConnectionState.IDLE;
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
            await this.requestMissions();
        }
        return this._curWaypoint;
    }

    /**
     * Converts mission data to a RawMission protobuf.
     * @returns {RawMission} a RawMission protobuf
     */
    getRawMissionProto() {
        const mission = this._mission;
        let raw = new telemetry.RawMission();
        raw.time = Date.now() / 1000;

        let i = 0;
        let waypoints = [];
        while (i < mission.length) {
            let waypointData = mission[i];

            waypoints.push(telemetry.RawMission.RawMissionItem.create({
                target_system: waypointData.target_system,
                target_component: waypointData.target_component,
                seq: waypointData.seq,
                frame: waypointData.frame,
                command: waypointData.command,
                current: waypointData.current,
                autocontinue: waypointData.autocontinue,
                param_1: waypointData.param1,
                param_2: waypointData.param2,
                param_3: waypointData.param3,
                param_4: waypointData.param4,
                x: waypointData.x,
                y: waypointData.y,
                z: waypointData.z,
                mission_type: waypointData.mission_type
            }));

            i++;
        }

        raw.mission_items = waypoints;
        return raw;
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
        console.log('Link: Created socket, binding messages now');
        const mav = this._mav;
        this._socket.on('message', (data) => {
            this._mav.parse(data);
            //console.log(data);
        });
        mav.on('MISSION_COUNT', (msg, fields) => this._handleMissionList(msg, fields));
        mav.on('MISSION_ITEM', (msg, fields) => this._handleMissionEntry(msg, fields));
        mav.on('MISSION_REQUEST', (msg, fields) => this._handleMissionRequest(msg, fields));
        mav.on('MISSION_ACK', (msg, fields) => this._handleMissionAck(msg, fields));
        mav.on('MISSION_CURRENT', (msg, fields) => {
            console.log(`Link: Plane reports that it is now on waypoint ${fields.seq}`);
            this._curWaypoint = fields.seq;
        });
        mav.on('GLOBAL_POSITION_INT', (msg, fields) => {
            const s = this.state;
            s.lat = fields.lat / 1e7;
            s.lon = fields.lon / 1e7;
            s.altMSL = fields.alt / 1000;
            s.altAGL = fields.relative_alt / 1000;
            s.yaw = fields.hdg / 100;
            this._connectSuccess(connectPromiseDecision);
        });
        mav.on('HEARTBEAT', (msg, fields) => {
            // TODO: useful stuff like what the plane is trying to do right now
        });
        mav.on('ATTITUDE', (msg, fields) => {
            const s = this.state;
            s.roll = fields.roll * 180 / Math.PI;
            s.pitch = fields.pitch * 180 / Math.PI;
            s.yaw = wrapIndex(fields.yaw * 180 / Math.PI, 360);
        });
        mav.on('VFR_HUD', (msg, fields) => {
            const s = this.state;
            s.airspeed = fields.airspeed;
            s.groundSpeed = fields.groundspeed;
            s.altMSL = fields.alt;
        });
    }

    _start_telemetry() {
        // Send a request to send telemetry at a constant rate.
        // createMessage doesn't even merit a callback,
        // and the source doesn't even tick the event loop,
        // but we still have to use it because the argument exists!
        this._mav.createMessage('REQUEST_DATA_STREAM',
            {
                'target_system': 1,
                'target_component': 1,
                'req_stream_id': 0,
                'req_message_rate': 5,
                'start_stop': 1
            }, (msg) => {
                this._socket.send(msg.buffer, destPort, destAddr, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Link: Requesting data stream...');
                    }
                });
            });
    }

    _fulfillMissionRequests(mission, err) {
        clearTimeout(this._missionFailTimeout);
        this._mission = mission;
        // Check if a mission promise exists - it may not if we did not
        // initiate the request...
        if (typeof(this._missionPromise) !== 'undefined') {
            if (err) {
                this._missionPromiseDecision.reject(err);
            } else {
                this._missionPromiseDecision.resolve(mission);
            }
            delete this._missionPromise;
            delete this._missionPromiseDecision;
        }
    }

    _handleMissionList(msg, fields) {
        const missionCount = fields.count;
        console.log(`Link: Got mission list with ${missionCount} missions`);
        const handler = new MissionReceiver(this._mav, this._socket,
            missionCount, (mission, cur) => {
                this._curWaypoint = cur;
                this._fulfillMissionRequests(mission);
                delete this._missionHandler;
            });
        this._missionHandler = handler;
        this._cxnState = ConnectionState.READING;
        clearInterval(this._missionInitialTimer);
        handler.start();
    }

    _handleMissionEntry(msg, fields) {
        if (typeof(this._missionHandler) === 'undefined') {
            // console.warn(`Waypoint ${fields.seq} was received without a mission receiver. Ignoring.`);
            return;
        }
        this._missionHandler.handleMessage(msg, fields);
    }

    _handleMissionRequest(msg, fields) {
        if (typeof(this._missionSender) === 'undefined') {
            console.warn(`Link: Request for wp ${fields.seq} was received without a mission sender. Ignoring.`);
            return;
        }
        this._missionSender.handleMissionRequest(msg, fields);
    }

    _handleMissionAck(msg, fields) {
        if (typeof(this._missionSender) === 'undefined') {
            console.warn('Link: Mission ack was received without a mission sender. Ignoring.');
            return;
        }
        this._missionSender.handleMissionAck(msg, fields);
    }

    _setupMissionRequest() {
        // Do a mission list request if there's no mission receiver
        if (typeof(this._missionHandler) === 'undefined') {
            // HACK: missionHandler will be created once the first packet
            // is received. But we don't want to do a request twice
            // accidentally, so we'll set it to null.
            this._missionHandler = null;
            this._sendMissionListRequest();
            // Retry initial request every 1500 ms. After 10000 ms, fail.
            this._missionInitialTimer = setInterval(
                () => this._sendMissionListRequest(), 1500
            );
            this._missionFailTimeout = setTimeout(
                () => {
                    clearInterval(this._missionInitialTimer);
                    this._fulfillMissionRequests(null, 'timeout receiving all missions');
                }, 10000
            );
        }
    }

    _sendMissionListRequest() {
        this._mav.createMessage(
            'MISSION_REQUEST_LIST',
            {'target_system': 1, 'target_component': 1, 'mission_type': 0},
            (msg) => this._socket.send(msg.buffer, destPort, destAddr, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Link: Requesting mission list');
                }
            })
        );
    }

    _sendMissionListAck() {
        this._mav.createMessage(
            'MISSION_ACK',
            {
                'target_system': 1,
                'target_component': 1,
                'type': 0,
                'mission_type': 0
            },
            (msg) => this._socket.send(msg.buffer, destPort, destAddr, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Link: Sending ack after receiving mission list');
                }
            })
        );
    }

}

class MissionReceiver {
    constructor(mav, socket, count, callback) {
        this._mav = mav;
        this._socket = socket;

        // The number of missions that need to be received.
        this.missionCount = count;

        // The mission number we are waiting for.
        // We have to receive each mission sequentially!
        this.missionNumber = 0;

        // The mission list.
        this.missions = [];

        // Called when all missions have been received
        // (missions, cur) => {...}
        this._done_callback = callback;

        // Timer for resending mission request
        this._sendTimer = null;

        // The mission currently being executed by the autopilot
        this._curMission = 0;
    }

    start() {
        if (this.missionNumber === this.missionCount) {
            process.nextTick(() => this._done_callback(this.missions, this._curMission));
        } else {
            this._startRequestMission(this.missionNumber);
        }
    }

    _startRequestMission(id) {
        if (this._sendTimer !== null) {
            throw Error('Can\'t request a mission - already waiting on one');
        }
        this._sendTimer = setInterval(
            () => this._requestMission(id), 1500
        );
    }

    _requestMission(id) {
        this._mav.createMessage('MISSION_REQUEST',
            {
                'target_system': 1,
                'target_component': 1,
                'seq': id,
                'mission_type': 0
            }, (msg) => {
                this._socket.send(msg.buffer, destPort, destAddr, (err) => {
                    if (err) {
                        console.error(`MissionReceiver: Error requesting mission ${id}: ${err}`);
                    } else {
                        console.log(`MissionReceiver: Requesting mission number ${id}`);
                    }
                });
            }
        );
    }

    done(func) {
        this._done_callback = func;
    }

    handleMessage(msg, fields) {
        if (fields.seq !== this.missionNumber) {
            console.warn(`MissionReceiver: Received mission ${fields.seq} but wanted mission ${this.missionNumber}`);
            return;
        }
        console.log(`MissionReceiver: Got mission ${fields.seq}`);
        clearTimeout(this._sendTimer);
        this._sendTimer = null;
        if (fields.cur == 1) {
            this._curMission = this.missionNumber;
        }
        this.missions.push(fields);
        this.missionNumber++;
        if (this.missionNumber === this.missionCount) {
            process.nextTick(() => this._done_callback(this.missions));
        } else {
            this._startRequestMission(this.missionNumber);
        }
    }
}

class MissionSender {
    constructor(mav, socket, mission, resolve, reject) {
        this._mav = mav;
        this._socket = socket;
        this._mission = mission;

        this._reqPromiseDecision = null;

        this._resolve = resolve;
        this._reject = reject;

        this._curWaypoint = null;
    }

    handleMissionRequest(msg, fields) {
        if (this._reqPromiseDecision && fields.seq == this._curWaypoint) {
            this._reqPromiseDecision.resolve();
            this._reqPromiseDecision = null;
        } else {
            console.warn(`MissionSender: Received mission request for waypoint ${fields.seq}, not ${this._curWaypoint}!`);
        }
    }

    handleMissionAck(msg, fields) {
        if (fields.type === 0) {
            if (this._reqPromiseDecision) {
                this._reqPromiseDecision.resolve();
            }
            this._resolve();
        } else {
            if (this._reqPromiseDecision) {
                this._reqPromiseDecision.reject();
            }
            this._reject(`MissionSender: MISSION_ACK was returned with error code ${fields.type}`);
        }
    }

    _sendClearAll() {
        this._mav.createMessage(
            'MISSION_CLEAR_ALL',
            {
                'target_system': 1,
                'target_component': 1,
                'mission_type': 255
            },
            (msg) => this._socket.send(msg.buffer, destPort, destAddr, (err) => {
                if (err) {
                    console.error(`MissionSender: Error sending mission clear request: ${err}`);
                } else {
                    console.log('MissionSender: Requesting to clear all missions');
                }
            })
        );
    }

    _sendCount() {
        this._mav.createMessage(
            'MISSION_COUNT',
            {
                'target_system': 1,
                'target_component': 1,
                'count': this._mission.length,
                'mission_type': 0
            },
            (msg) => this._socket.send(msg.buffer, destPort, destAddr, (err) => {
                if (err) {
                    console.error(`MissionSender: Error writing ${this._mission.length} waypoints: ${err}`);
                } else {
                    console.log(`MissionSender: Requesting to write ${this._mission.length} waypoints`);
                }
            })
        );
    }

    _sendWaypoint(waypoint) {
        console.log(`MissionSender: Assembling waypoint ${waypoint.seq}`);

        // node-mavlink wants param1 instead of param_1 and so on.
        waypoint.param1 = waypoint.param_1;
        waypoint.param2 = waypoint.param_2;
        waypoint.param3 = waypoint.param_3;
        waypoint.param4 = waypoint.param_4;

        this._mav.createMessage(
            'MISSION_ITEM',
            waypoint,
            (msg) => this._socket.send(msg.buffer, destPort, destAddr, (err) => {
                if (err) {
                    console.error(`MissionSender: Error sending waypoint ${waypoint.seq}: ${err}`);
                } else {
                    console.log(`MissionSender: Sending waypoint ${waypoint.seq}`);
                }
            })
        );
    }

    async send() {
        let repeatTimer = null;
        let repeatCount = 0;
        const maxRepeats = 4;
        try {
            await new Promise((resolve, reject) => {
                this._reqPromiseDecision = {
                    'resolve': resolve,
                    'reject': reject
                };
                this._sendClearAll();
                repeatTimer = setInterval(() => {
                    this._sendClearAll();

                    repeatCount++;
                    if (repeatCount == maxRepeats) {
                        reject('timeout clearing waypoints');
                    }
                }, 1000);
            }).catch((err) => {
                throw err;
            });

            repeatCount = 0;
            clearInterval(repeatTimer);

            if (this._mission.length == 0) {
                return;
            }

            await new Promise((resolve, reject) => {
                this._reqPromiseDecision = {
                    'resolve': resolve,
                    'reject': reject
                };
                this._sendCount();
                repeatTimer = setInterval(() => {
                    this._sendCount();

                    repeatCount++;
                    if (repeatCount == maxRepeats) {
                        reject('timeout sending mission count');
                    }
                }, 1000);
            }).catch((err) => {
                throw err;
            });

            repeatCount = 0;
            clearInterval(repeatTimer);

            while (this._curWaypoint < this._mission.length) {
                let waypoint = this._mission[this._curWaypoint];
                this._curWaypoint++;
                await new Promise((resolve, reject) => {
                    this._reqPromiseDecision = {
                        'resolve': resolve,
                        'reject': reject
                    };
                    this._sendWaypoint(waypoint);
                    repeatTimer = setInterval(() => {
                        this._sendWaypoint(waypoint);

                        repeatCount++;
                        if (repeatCount == maxRepeats) {
                            reject(`timeout sending waypoint ${this._curWaypoint}`);
                        }
                    }, 1000);
                }).catch((err) => {
                    throw err;
                });
                repeatCount = 0;
                clearInterval(repeatTimer);
            }
        } catch (e) {
            console.error(`Unable to send mission data: ${e}`);
            clearInterval(repeatTimer);
            this._reject(e);
        }
    }
}
