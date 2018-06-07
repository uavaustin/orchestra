import express from 'express';
import bodyParser from 'body-parser';

import { telemetry } from './messages';
import { sendJsonOrProto } from './util';
import PlaneLink from './link';

const app = express();
const plane = new PlaneLink();
const connectPromise = plane.connect();

// By default, the bodies are assumed to be protobufs.
app.use(bodyParser.json({ type: 'application/json' }));
app.use(bodyParser.raw({ type: '*/*' }));

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
            res.send(204);
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
        let msg = new telemetry.Overview();
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

app.get('/api/raw-mission', (req, res) => {
    connectPromise.then(() => {
        plane.requestMissions().then(() => {
            sendJsonOrProto(req, res, plane.getRawMissionProto());
        }).catch((err) => {
            console.error(err);
            res.send(504);
        });
    }).catch((err) => {
        console.error(err);
        res.send(504);
    });
});

app.post('/api/raw-mission', (req, res) => {
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

    connectPromise.then(() => {
        let mission = rawMission.mission_items;

        plane.sendMission(mission).then(() => {
            res.sendStatus(200);
        });
    }).catch((err) => {
        console.error(err);
        res.sendStatus(504);
    });
});

app.get('/api/current-waypoint', (req, res) => {
    connectPromise.then(() => {
        plane.getCurrentWaypoint().then((waypoint) => {
            res.send({
                seq: waypoint
            });
        });
    }).catch((err) => {
        console.err(err);
        res.sendStatus(504);
    });
});

app.post('/api/current-waypoint', (req, res) => {
    if (typeof req.body.seq === 'undefined') {
        res.status(400);
        res.send({err: 'Must contain seq'});
        return;
    }

    connectPromise.then(() => {
        plane.setCurrentWaypoint(req.body.seq).then((waypoint) => {
            res.sendStatus(200);
        });
    }).catch((err) => {
        console.err(err);
        res.sendStatus(504);
    });
});

let server = app.listen(5000);

console.log('Running server with Express at http://0.0.0.0:5000');

export { app, server };
