import express from 'express';
import mavlink from 'mavlink';
import dgram from 'dgram';

import interop from './messages/interop_pb';
import telemetry from './messages/telemetry_pb';

const destAddr = '127.0.0.1', destPort = 14552;

class PlaneState {
	constructor() {
		this.lat = null;
		this.lon = null;
		this.alt = null;
		this.yaw = null;
		this.roll = null;
		this.pitch = null;
	}

	/*
	 * Returns whether or not any telemetry data has been received.
	 */
	isInitialized() {
        return !([this.lat, this.lon, this.alt, this.yaw,
        	this.roll, this.pitch].contains(null));
	}
}

class PlaneLink {
	constructor() {
		this._mav = new mavlink(1, 1);
		this._mav.on('ready', this._createSocket);
		this.state = new PlaneState();
	}

	_createSocket() {
		let socket = dgram.createSocket('udp4');
		socket.bind({'address': 'localhost', 'port': 0}, this._bindMessages);
		this._socket = socket;
	}

	_bindMessages() {
		let mav = this._mav;
		this._socket.on('message', (data) => {
			mav.parse(data);
		});
		mav.on('MISSION_COUNT', this._handleMissionList);
		mav.on('MISSION_ITEM', this._handleMissionEntry);
		// Add your handlers here!

		// Send telemetry constantly.
		// createMessage doesn't even merit a callback,
		// and the source doesn't even tick the event loop,
		// but we still have to use it because the argument exists!
		mav.createMessage('REQUEST_DATA_STREAM',
		{
			'target_system': 1,
			'target_component': 1,
			'req_stream_id': 0,
			'req_message_rate': 5,
			'start_stop': 1
		}, (msg) => {
			this._socket.send(msg.buffer, destPort, destAddr);
		});
	}

	_handleMissionList(msg, fields) {
		let missionCount = fields.count;
		let handler = new MissionReceiver(this._mav, missionCount);
		this._mission_handler = handler;
	}

	_handleMissionEntry(msg, fields) {
		if (!this._mission_handler) {
			console.error("Mission was received without a mission receiver. Ignoring message.");
			return;
		}
		this._mission_handler.handleMessage(msg, fields);
	}
}

class MissionReceiver {
	constructor(mav, count) {
		this._mav = mav;
		// The number of missions that need to be received.
		this.missionCount = count;

		// The mission number we are waiting for.
		// We have to receive each mission sequentially!
		this.missionNumber = 0;

		// The mission list.
		this.missions = [];

		// Called when all missions have been received
		this._done_callback = (missions) => {};
	}

	done(func) {
		this._done_callback = func;
	}

	handleMessage(msg, fields) {
		this.missionNumber++;
		if (missionNumber === missionCount) {
			this._done_callback(this.missions);
		}
	}
}

let app = express();

app.get('/', (req, res) => {
	res.set('content-type', 'text/plain');
	res.send('Telemetry endpoint');
}

app.get('/api/alive', (req, res) => {
    res.set('content-type', 'text/plain');
    res.send('Yes, I\'m alive!\n');
});

app.get('/api/interop-telem', (req, res) => {
	res.set('content-type', 'text/plain');
	res.send('interop::InteropTelem');
});

app.get('/api/camera-telem', (req, res) => {
	res.set('content-type', 'text/plain');
	res.send('telemetry::CameraTelem');
});

app.get('/api/raw-mission', (req, res) => {
	res.set('content-type', 'text/plain');
	res.send('telemetry::RawMission');
});

let server = app.listen(5000);

console.log('Running server with Express at http://0.0.0.0:5000');

export { app, server };
