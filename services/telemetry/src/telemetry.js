import express from 'express';
import bodyParser from 'body-parser';

import { Overview, RawMission } from './messages/telemetry_pb';
import { sendJsonOrProto } from './util';
import PlaneLink from './link';

const app = express();
const plane = new PlaneLink();
const connectPromise = plane.connect();

app.use(bodyParser.json());
app.use(bodyParser.raw({ type: 'application/x-protobuf' }));

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

app.post('/api/mission', (req, res) => {
    if (!req.get('Content-Type').startsWith('application/json')) {
        res.status(502).send('Sorry, we don\'t accept your type of credit card.');
    }
    connectPromise.then(() => {
        console.log(req.body);
        plane.sendMission(req.body).then(() => {
            res.send(200);
        }).catch((err) => {
            console.error(err);
            res.send(504);
        });
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
                'current': 0,
                'autocontinue': 1,
                'param1': waypoint.getParam1(),
                'param2': waypoint.getParam2(),
                'param3': waypoint.getParam3(),
                'param4': waypoint.getParam4(),
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
