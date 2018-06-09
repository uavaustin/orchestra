import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';

import { telemetry } from './messages';
import { sendJsonOrProto } from './util';
import PlaneLink from './link';

export default class Telemetry {
    constructor() {
        this.app = express();
        this.plane = null;
        this.server = null;

        // By default, the bodies are assumed to be protobufs.
        this.app.use(bodyParser.json({ type: 'application/json' }));
        this.app.use(bodyParser.raw({ type: '*/*' }));
        
        this.app.get('/', (req, res) => {
            res.set('content-type', 'text/plain');
            res.send('Telemetry endpoint');
        });
        
        this.app.get('/api/alive', (req, res) => {
            res.set('content-type', 'text/plain');
            if (this.plane.state.isPopulated()) {
                res.send('Yes, I\'m alive!\n');
            } else {
                res.status(503).send('No plane data available yet\n');
            }
        });
        
        this.app.get('/api/interop-telem', (req, res) => {
            if (this.plane.state.isPopulated()) {
                sendJsonOrProto(req, res, this.plane.state.getInteropTelemProto());
            } else {
                res.send(503);
            }
        });
        
        this.app.get('/api/camera-telem', (req, res) => {
            if (this.plane.state.isPopulated()) {
                sendJsonOrProto(req, res, this.plane.state.getCameraTelemProto());
            } else {
                res.send(204);
            }
        });
        
        this.app.get('/api/overview', (req, res) => {
            if (!this.plane.state.isPopulated()) {
                res.send(503);
                return;
            }
            const state = this.plane.state;
            let msg = new telemetry.Overview();
            msg.setPos(state.getPositionProto());
            msg.setRot(state.getRotationProto());
            msg.setAlt(state.getAltitudeProto());
            msg.setVel(state.getVelocityProto());
            msg.setSpeed(state.getSpeedProto());
            msg.setBattery(state.getBatteryProto());
            sendJsonOrProto(req, res, msg);
        });
        
        this.app.get('/api/raw-mission', (req, res) => {
            this.plane.requestMissions().then(() => {
                sendJsonOrProto(req, res, this.plane.getRawMissionProto());
            }).catch((err) => {
                console.error(err);
                res.send(504);
            });
        });
        
        this.app.post('/api/raw-mission', (req, res) => {
            let rawMission;
        
            console.log(`Received raw mission (${req.body.length} bytes)`);
        
            if (req.get('content-type') === 'application/json') {
                let err = telemetry.RawMission.verify(req.body);
                if (err) {
                    throw err;
                }
                rawMission = telemetry.RawMission.fromObject(req.body);
            } else {
                rawMission = telemetry.RawMission.decode(req.body);
            }
        
            let mission = rawMission.mission_items;
        
            this.plane.sendMission(mission).then(() => {
                res.sendStatus(200);
            });
        });
        
        this.app.get('/api/current-waypoint', (req, res) => {
            this.plane.getCurrentWaypoint().then((waypoint) => {
                res.send({
                    seq: waypoint
                });
            });
        });
        
        this.app.post('/api/current-waypoint', (req, res) => {
            if (typeof req.body.seq === 'undefined') {
                res.status(400);
                res.send({err: 'Must contain seq'});
                return;
            }
        
            this.plane.setCurrentWaypoint(req.body.seq).then((waypoint) => {
                res.sendStatus(200);
            });
        });

        this.app.get('/api/logs/missions-received', (req, res) => {
            res.sendFile('missions-received.txt', { root: path.join(__dirname, '..') });
        });
    }

    async start() {
        if (this.server) {
            throw Error('Telemetry server is already running');
        }

        const PORT = 5000;

        this.plane = new PlaneLink();
        await this.plane.connect();
        this.server = this.app.listen(PORT);
        console.log(`Running server with Express at http://0.0.0.0:${PORT}`);
    }

    async stop() {
        await new Promise((resolve, reject) => {
            this.plane.disconnect().then(() => {
                this.server.close(() => {
                    console.log('Closed server.')
                    this.server = null;
                    resolve();
                });
            });
        });
    }
}