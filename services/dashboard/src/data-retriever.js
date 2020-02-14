import EventEmitter from 'events';

import async from 'async';
import request from 'request';

import { stats } from './messages';

/**
 * Starts workers to poll data from different services.
 */
export default class DataRetriever extends EventEmitter {
    constructor() {
        super();

        this._startPingTimesWorker();
        this._startTelemUploadRateWorker();
        this._startImageCapRateWorker();
    }

    _startPingTimesWorker() {
        async.forever((next) => {
            _getPingTimes((data) => {
                this.emit('ping-times', data);
                setTimeout(next, 1000);
            });
        });
    }

    _startTelemUploadRateWorker() {
        async.forever((next) => {
            _getTelemUploadRate((data) => {
                this.emit('telem-upload-rate', data);
                setTimeout(next, 1000);
            });
        });
    }

    _startImageCapRateWorker() {
        async.forever((next) => {
            _getImageCapRate('plane', (data) => {
                this.emit('image-cap-rate-plane', data);
                setTimeout(next, 1000);
            });
        });

        async.forever((next) => {
            _getImageCapRate('ground', (data) => {
                this.emit('image-cap-rate-ground', data);
                setTimeout(next, 1000);
            });
        });
    }
}

/** Convert a request response to a protobuf message object. */
function _parseMessage(err, resp, message) {
    // If we don't have a 2xx response code, return null.
    if (err || !(/^2/.test('' + resp.statusCode))) {
        return null;
    } else {
        return message.decode(resp.body);
    }
}

function _getPingTimes(cb) {
    request.get({
        uri: 'http://' + process.env.PONG_URL + '/api/ping',
        encoding: null,
        timeout: 2000,
    }, (err, resp) => {
        // Parse the message as the PingTimes protobuf.
        let message = _parseMessage(err, resp, PingTimes);
        let data = [];

        // If we have a message (i.e. no error), then take each
        // listing and put it in a 5 element array corresponding to
        // the ping time headers, with the first being if the service
        // is online or not. This is sorted first by increasing
        // hostname, and then by increasing port number.
        if (message !== null) {
            data = message.list.sort((a, b) =>
                a.host !== b.host ? a.host > b.host : a.port > b.port
            ).map(time => [
                time.online, time.name, time.host, time.port, time.ms
            ]);
        }

        cb(data);
    });
}

function _getTelemUploadRate(cb) {
    request.get({
        uri: 'http://' + process.env.FORWARD_INTEROP_URL + '/api/upload-rate',
        encoding: null,
        timeout: 2000,
    }, (err, resp) => {
        // Parse the message as the InteropUploadRate protobuf.
        let message = _parseMessage(err, resp, stats.InteropUploadRate);

        let available = message !== null;
        let rates;

        if (available) {
            rates = [
                message.total_1, message.total_5,
                message.fresh_1, message.fresh_5
            ];
        } else {
            rates = [0.0, 0.0, 0.0, 0.0];
        }

        cb({ rates, available });
    });
}

function _getImageCapRate(source, cb) {
    let url;

    if (source === 'plane') {
        url = process.env.PLANE_IMAGERY_URL;
    } else if (source === 'ground') {
        url = process.env.GROUND_IMAGERY_URL;
    }

    request.get({
        uri: 'http://' + url + '/api/capture-rate',
        encoding: null,
        timeout: 2000,
    }, (err, resp) => {
        // Parse the message as the ImageCaptureRate protobuf.
        let message = _parseMessage(err, resp, stats.ImageCaptureRate);

        let available = message !== null;
        let rate;

        if (available) {
            rate = message.rate_5;
        } else {
            rate = [0.0];
        }

        cb({ rate, available });
    });
}
