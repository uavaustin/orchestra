import express from 'express';
import mavlink from 'mavlink';
import dgram from 'dgram';
import queue from 'async/queue';
import series from 'async/series';

import {
    Overview, Position, Rotation,
    Altitude, Velocity, Speed,
    RawMission, CameraTelem
} from './messages/telemetry_pb';
import { AerialPosition, InteropTelem } from './messages/interop_pb';


// Parse CXN_STR (defined in Docker config)
// Capture group 0: IP address (IPv4, IPv6, and hostname are all acceptable)
// Capture group 1: port
if (typeof(process.env['CXN_STR']) === 'undefined') {
    throw Error('CXN_STR environment variable missing');
}
const mavHost = /(?:udpout:)?(.+):(\d+)/.exec(process.env['CXN_STR']);
const destAddr = mavHost[1];
const destPort = parseInt(mavHost[2]);

// Python-like remainder.
// https://stackoverflow.com/a/3417242
function wrapIndex(i, i_max) {
    return ((i % i_max) + i_max) % i_max;
}

class PlaneState {
    constructor() {
        this.lat = null;
        this.lon = null;
        this.altMSL = null;
        this.altAGL = null;
        this.vx = null;
        this.vy = null;
        this.vz = null;
        this.roll = null;
        this.pitch = null;
        this.yaw = null;
        this.airspeed = null;
        this.groundSpeed = null;
    }

    getPositionProto() {
        let pos = new Position();
        pos.setLat(this.lat);
        pos.setLon(this.lon);
        return pos;
    }

    getAerialPositionProto() {
        let aerpos = new AerialPosition();
        aerpos.setLat(this.lat);
        aerpos.setLon(this.lon);
        aerpos.setAltMsl(this.altMSL);
        return aerpos;
    }

    getRotationProto() {
        let rot = new Rotation();
        rot.setYaw(this.yaw);
        rot.setPitch(this.pitch);
        rot.setRoll(this.roll);
        return rot;
    }

    getAltitudeProto() {
        let alt = new Altitude();
        alt.setMsl(this.altMSL);
        alt.setAgl(this.altAGL);
        return alt;
    }

    getVelocityProto() {
        let vel = new Velocity();
        vel.setX(this.vx);
        vel.setY(this.vy);
        vel.setZ(this.vz);
        return vel;
    }

    getSpeedProto() {
        let speed = new Speed();
        speed.setAirspeed(this.airspeed);
        speed.setGroundSpeed(this.groundSpeed);
        return speed;
    }

    getInteropTelemProto() {
        let telem = new InteropTelem();
        // Unix time in seconds, with decimal precision
        telem.setTime(Date.now() / 1000);
        telem.setPos(this.getAerialPositionProto());
        telem.setYaw(this.yaw);
        return telem;
    }

    getCameraTelemProto() {
        let telem = new CameraTelem();
        telem.setTime(Date.now() / 1000);
        telem.setLat(this.lat);
        telem.setLon(this.lon);
        telem.setAlt(this.altAGL);
        telem.setYaw(this.yaw);
        telem.setPitch(this.pitch);
        telem.setRoll(this.roll);
        return telem;
    }

    /*
     * Returns whether or not enough telemetry data has been received.
     */
    isPopulated() {
        return !([this.lat, this.lon, this.yaw,
            this.roll, this.pitch, this.altAGL].includes(null));
    }
}

const ConnectionState = Object.freeze({
    NOT_CONNECTED: Symbol('not_connected'),
    IDLE:          Symbol('idle'),
    READING:       Symbol('reading'),
    WRITING:       Symbol('writing')
});

class PlaneLink {
    constructor() {
        this._mav = new mavlink(1, 1);
        this.state = new PlaneState();
        this._cxnState = ConnectionState.NOT_CONNECTED;
        this._taskQueue = queue((task, cb) => {task(); cb();});
    }
    
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

    _connectSuccess(connectPromiseDecision) {
        if (this._cxnState === ConnectionState.NOT_CONNECTED) {
            console.log('Connection established to plane');

            connectPromiseDecision.resolve();
            this._cxnState = ConnectionState.IDLE;

            clearInterval(this._connect_timeout);
            delete this._connect_timeout;
        }
    }

    _bindMessages(connectPromiseDecision) {
        console.log('Created socket, binding messages now');
        const mav = this._mav;
        this._socket.on('message', (data) => {
            this._mav.parse(data);
            //console.log(data);
        });
        mav.on('MISSION_COUNT', (msg, fields) => this._handleMissionList(msg, fields));
        mav.on('MISSION_ITEM', (msg, fields) => this._handleMissionEntry(msg, fields));
        mav.on('MISSION_REQUEST', (msg, fields) => this._handleMissionRequest(msg, fields));
        mav.on('MISSION_ACK', (msg, fields) => this._handleMissionAck(msg, fields));
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
            // useful stuff like what the plane is trying to do right now
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
                        console.log('Requesting data stream...');
                    }
                });
            });
    }

    _fulfillMissionRequests(missions, err) {
        clearTimeout(this._missionFailTimeout);
        this._waypoints = missions;
        // Check if a mission promise exists - it may not if we did not
        // initiate the request...
        if (typeof(this._missionPromise) !== 'undefined') {
            if (err) {
                this._missionPromiseDecision.reject(err);
            } else {
                this._missionPromiseDecision.resolve(missions);
            }
            delete this._missionPromise;
            delete this._missionPromiseDecision;
        }
    }

    _handleMissionList(msg, fields) {
        const missionCount = fields.count;
        console.log(`Got mission list with ${missionCount} missions`);
        const handler = new MissionReceiver(this._mav, this._socket,
            missionCount, (missions) => {
                this._fulfillMissionRequests(missions);
                delete this._missionHandler;
            });
        this._missionHandler = handler;
        this._cxnState = ConnectionState.READING;
        clearInterval(this._missionInitialTimer);
        handler.start();
    }

    _handleMissionEntry(msg, fields) {
        if (typeof(this._missionHandler) === 'undefined') {
            console.warn('Mission was received without a mission receiver. Ignoring message.');
            return;
        }
        this._missionHandler.handleMessage(msg, fields);
    }

    _handleMissionRequest(msg, fields) {
        if (typeof(this._missionSender) === 'undefined') {
            console.warn('Mission request was received without a mission sender. Ignoring message.');
            return;
        }
        this._missionSender.handleMissionRequest(msg, fields);
    }

    _handleMissionAck(msg, fields) {
        if (typeof(this._missionSender) === 'undefined') {
            console.warn('Mission ack was received without a mission sender. Ignoring message.');
            return;
        }
        this._missionSender.handleMissionAck(msg, fields);
    }

    /**
     * Performs a mission list request if one is not already underway.
     * Returns a promise.
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
                this._cxnState = ConnectionState.IDLE;
            });
        }
        return await this._missionPromise;
    }

    _setupMissionRequest() {
        // Do a mission list request if there's no mission receiver
        if (typeof(this._missionHandler) === 'undefined') {
            // HACK: missionHandler will be created once the first packet
            // is received. But we don't want to do a request twice
            // accidentally, so we'll set it to null.
            this._missionHandler = null;
            this._sendMissionListRequest();
            // Retry initial request every 1500 ms. After 3000 ms, fail.
            this._missionInitialTimer = setInterval(
                () => this._sendMissionListRequest(), 1500
            );
            this._missionFailTimeout = setTimeout(
                () => {
                    clearInterval(this._missionInitialTimer);
                    this._fulfillMissionRequests(null, 'timeout');
                }, 5000
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
                    console.log('Requesting mission list');
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
                    console.log('Requesting mission list');
                }
            })
        );
    }

    getRawMissionProto() {
        const mission = this._mission;
        let raw = new RawMission();
        raw.setTime(Date.now() / 1000);

        let i = 0;
        let waypoints = [];
        for (const waypointData in mission) {
            let waypoint = new RawMission.Command();
            waypoint.setTargetSystem(waypointData.target_system);
            waypoint.setTargetComponent(waypointData.target_component);
            waypoint.setSeq(waypointData.seq);
            waypoint.setFrame(waypointData.frame);
            waypoint.setCommand(waypointData.command);
            waypoint.setParam1(waypointData.param1);
            waypoint.setParam2(waypointData.param2);
            waypoint.setParam3(waypointData.param3);
            waypoint.setParam4(waypointData.param4);
            waypoint.setParam5(waypointData.x);
            waypoint.setParam6(waypointData.y);
            waypoint.setParam7(waypointData.z);
            waypoints.push(waypoint);
            i++;
            if (waypointData.current) {
                raw.setNext(i);
            }
        }
        raw.setCommandsList(waypoints);
        return raw;
    }

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
        // (missions) => {...}
        this._done_callback = callback;

        // Timer for resending mission request
        this._sendTimer = null;
    }

    start() {
        if (this.missionNumber === this.missionCount) {
            process.nextTick(() => this._done_callback(this.missions));
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
                        console.error(err);
                    } else {
                        console.log(`Requesting mission number ${id}`);
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
            console.warn(`Received mission ${fields.seq} but wanted mission ${this.missionNumber}`);
            return;
        }
        clearTimeout(this._sendTimer);
        this._sendTimer = null;
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

        this._curWaypoint = 0;
    }

    handleMissionRequest(msg, fields) {
        if (this._reqPromiseDecision && fields.seq == this._curWaypoint) {
            this._reqPromiseDecision.resolve();
            this._reqPromiseDecision = null;
        } else {
            console.warn('Received an unexpected mission request!');
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
            this._reject(fields.type);
        }
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
                    console.error(err);
                } else {
                    console.log(`Requesting to write ${this._mission.length} missions`);
                }
            })
        );
    }

    _sendWaypoint(waypoint) {
        this._mav.createMessage(
            'MISSION_ITEM',
            waypoint,
            (msg) => this._socket.send(msg.buffer, destPort, destAddr, (err) => {
                if (err) {
                    console.error(err);
                } else {
                    console.log(`Sending waypoint ${waypoint.seq}`);
                }
            })
        );
    }

    async send() {
        let repeatTimer = null;
        try {
            await new Promise((resolve, reject) => {
                this._reqPromiseDecision = {
                    'resolve': resolve,
                    'reject': reject
                };
                this._sendCount();
                repeatTimer = setInterval(() => this._sendCount(), 1000);
            });
            clearInterval(repeatTimer);
            for (let waypoint in this._mission) {
                this._curWaypoint++;
                await new Promise((resolve, reject) => {
                    this._reqPromiseDecision = {
                        'resolve': resolve,
                        'reject': reject
                    };
                    this._sendWaypoint(waypoint);
                    repeatTimer = setInterval(() => this._sendWaypoint(waypoint), 1000);
                });
                clearInterval(repeatTimer);
            }
        } catch (e) {
            console.error(e);
            clearInterval(repeatTimer);
        }
    }
}

function sendJsonOrProto(req, res, proto) {
    const accept = req.get('accept');

    if (accept === undefined || !accept.startsWith('application/json')) {
        res.set('content-type', 'application/x-protobuf');
        res.send(Buffer.from(proto.serializeBinary()));
    } else {
        res.send(proto.toObject());
    }
}

const app = express();
const plane = new PlaneLink();
const connectPromise = plane.connect();

app.get('/', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send('Telemetry endpoint');
});

app.get('/api/alive', (req, res) => {
    res.set('content-type', 'text/plain');
    connectPromise.then(() => {
        if (plane.state.isPopulated()) {
            res.send('Yes, I\'m alive!\n');
        } else {
            res.status(503).send('No plane data available yet\n');
        }
    }).catch((err) => {
        console.error(err);
        res.send(504);
    });
});

app.get('/api/interop-telem', (req, res) => {
    connectPromise.then(() => {
        if (plane.state.isPopulated()) {
            sendJsonOrProto(req, res, plane.state.getInteropTelemProto());
        } else {
            res.send(503);
        }
    }).catch((err) => {
        console.error(err);
        res.send(504);
    });
});

app.get('/api/camera-telem', (req, res) => {
    connectPromise.then(() => {
        if (plane.state.isPopulated()) {
            sendJsonOrProto(req, res, plane.state.getCameraTelemProto());
        } else {
            res.send(503);
        }
    }).catch((err) => {
        console.error(err);
        res.send(504);
    });
});

app.get('/api/overview', (req, res) => {
    connectPromise.then(() => {
        if (!plane.state.isPopulated()) {
            res.send(503);
            return;
        }
        const state = plane.state;
        let msg = new Overview();
        msg.setPos(state.getPositionProto());
        msg.setRot(state.getRotationProto());
        msg.setAlt(state.getAltitudeProto());
        msg.setVel(state.getVelocityProto());
        msg.setSpeed(state.getSpeedProto());
        sendJsonOrProto(req, res, msg);
    }).catch((err) => {
        console.error(err);
        res.send(504);
    });
});

app.get('/api/mission', (req, res) => {
    connectPromise.then(() => {
        res.set('content-type', 'application/json');
        plane.requestMissions().then((missions) => {
            res.send(missions);
        }).catch((err) => {
            console.error(err);
            res.status(504).send({'error': err});
        });
    }).catch((err) => {
        console.error(err);
        res.send(504);
    });
});

app.get('/api/raw-mission', (req, res) => {
    connectPromise.then(() => {
        plane.requestMissions().then(() => {
            sendJsonOrProto(req, res, plane.getRawMissionProto());
        }).catch((err) => {
            console.error(err);
            res.status(504).send({'error': err});
        });
    }).catch((err) => {
        console.error(err);
        res.send(504);
    });
});

app.post('/api/raw-mission', (req, res) => {
    connectPromise.then(() => {
        const rawMission = new RawMission(req.body);
        let mission = [];
        for (const waypoint in rawMission.getCommandsList()) {
            mission.push({
                'target_system': waypoint.getTargetSystem(),
                'target_component': waypoint.getTargetComponent(),
                'seq': waypoint.getSeq(),
                'frame': waypoint.getFrame(),
                'command': waypoint.getCommand(),
                'param_1': waypoint.getParam1(),
                'param_2': waypoint.getParam2(),
                'param_3': waypoint.getParam3(),
                'param_4': waypoint.getParam4(),
                'x': waypoint.getParam5(),
                'y': waypoint.getParam6(),
                'z': waypoint.getParam7()
            });
        }
        plane.sendMission(mission).then(() => {
            res.send(200);
        }).catch((err) => {
            console.error(err);
            res.send(504);
        });
    });
});

let server = app.listen(5000);

console.log('Running server with Express at http://0.0.0.0:5000');

export { app, server };
