import express from 'express';
import mavlink from 'mavlink';
import dgram from 'dgram';

import {
    Overview, Position, Rotation,
    Altitude, Velocity, Speed
} from './messages/telemetry_pb';
import { AerialPosition, InteropTelem } from './messages/interop_pb';

const destAddr = '172.16.238.10', destPort = 14550;

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

    /*
     * Returns whether or not enough telemetry data has been received.
     */
    isPopulated() {
        return !([this.lat, this.lon, this.yaw, this.altAGL, this.altMSL].includes(null));
    }
}

class PlaneLink {
    constructor() {
        this._mav = new mavlink(1, 1);
        this._mav.on('ready', () => this._createSocket());
        this.state = new PlaneState();
        this._missionCallbacks = [];
        console.log('Establishing mavlink...');
    }

    _createSocket() {
        const socket = dgram.createSocket('udp4');
        this._socket = socket;
        socket.on('error', (err) => {
            console.error('Socket connection error! ', err);
        });
        socket.on('listening', () => this._bindMessages());
        socket.bind(25565);
        console.log('Creating socket...');
    }

    _bindMessages() {
        console.log('Created socket, binding messages now');
        const mav = this._mav;
        this._socket.on('message', (data) => {
            if (typeof(this._connect_timeout) !== 'undefined') {
                clearInterval(this._connect_timeout);
                this._connect_timeout = null;
            }
            this._mav.parse(data);
            //console.log(data);
        });
        mav.on('MISSION_COUNT', (msg, fields) => this._handleMissionList(msg, fields));
        mav.on('MISSION_ITEM', (msg, fields) => this._handleMissionEntry(msg, fields));
        mav.on('GLOBAL_POSITION_INT', (msg, fields) => {
            const s = this.state;
            s.lat = fields.lat / 1e7;
            s.lon = fields.lon / 1e7;
            s.altMSL = fields.alt / 1000;
            s.altAGL = fields.relative_alt / 1000;
            s.yaw = fields.hdg / 100;
            //console.log(`${fields.lat}, ${fields.lon}`);
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


        this._connect_timeout = setInterval(() => this._start_telemetry(), 1500);
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

    _fulfillMissionRequests(missions) {
        clearTimeout(this._missionFailTimeout);
        this._missions = missions;
        this._missionCallbacks.forEach(cb => process.nextTick(() => cb(missions)));
        this._missionCallbacks = [];
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
        clearInterval(this._missionInitialTimer);
        handler.start();
    }

    _handleMissionEntry(msg, fields) {
        if (typeof(this._missionHandler) === 'undefined') {
            console.error('Mission was received without a mission receiver. Ignoring message.');
            return;
        }
        this._missionHandler.handleMessage(msg, fields);
    }

    /**
     * Subscribes a callback to the mission receiver and performs
     * a mission list request if one is not already underway.
     * @param {function(missions):void} callback called when all missions are received
     */
    requestMissions(callback) {
        this._missionCallbacks.push(callback);

        // Do a mission list request if there's no mission receiver
        if (typeof(this._missionHandler) === 'undefined') {
            // HACK: missionHandler will be created once the first packet
            // is received. But we don't want to do a request twice
            // accidentally, so we'll set it to null.
            this._missionHandler = null;
            this._sendMissionRequest();
            // Retry initial request every 1500 ms. After 3000 ms, fail.
            this._missionInitialTimer = setInterval(
                () => this._sendMissionRequest(), 1500
            );
            this._missionFailTimeout = setTimeout(
                () => {
                    clearInterval(this._missionInitialTimer);
                    this._fulfillMissionRequests(null);
                }, 3000
            );
        }
    }

    _sendMissionRequest() {
        this._mav.createMessage('MISSION_REQUEST_LIST',
            {'target_system': 1, 'target_component': 1, 'mission_type': 0},
            (msg) => {
                this._socket.send(msg.buffer, destPort, destAddr, (err) => {
                    if (err) {
                        console.error(err);
                    } else {
                        console.log('Requesting mission list');
                    }
                });
            }
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

app.get('/', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send('Telemetry endpoint');
});

app.get('/api/alive', (req, res) => {
    res.set('content-type', 'text/plain');
    if (plane.state.isPopulated()) {
        res.send('Yes, I\'m alive!\n');
    } else {
        res.send(503, 'No plane data available yet\n');
    }
});

app.get('/api/interop-telem', (req, res) => {
    let telem = new InteropTelem();
    // Unix time in seconds, with decimal precision
    telem.setTime(Date.now() / 1000);
    telem.setPos(plane.state.getAerialPositionProto());
    telem.setYaw(plane.state.yaw);
    sendJsonOrProto(req, res, telem);
});

app.get('/api/overview', (req, res) => {
    const state = plane.state;
    let msg = new Overview();
    msg.setPos(state.getPositionProto());
    msg.setRot(state.getRotationProto());
    msg.setAlt(state.getAltitudeProto());
    msg.setVel(state.getVelocityProto());
    msg.setSpeed(state.getSpeedProto());
    sendJsonOrProto(req, res, msg);
});

/* Probably will not be needed anymore.
app.get('/api/camera-telem', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send('telemetry::CameraTelem');
});
*/

app.get('/api/missions', (req, res) => {
    res.set('content-type', 'application/json');
    //res.send('telemetry::RawMission');
    plane.requestMissions((missions) => {
        if (missions !== null) {
            res.send(missions);
        } else {
            res.send(504, {'error': 'timeout'});
        }
    });
});

let server = app.listen(5000);

console.log('Running server with Express at http://0.0.0.0:5000');

export { app, server };
