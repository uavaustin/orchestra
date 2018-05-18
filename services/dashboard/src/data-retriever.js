import EventEmitter from 'events';

import async from 'async';
import request from 'request';

import {
    PingTimes, InteropUploadRate, ImageCaptureRate
} from './messages/stats_pb';

/**
 * Starts workers to poll data from different services.
 */
export default class DataRetriever extends EventEmitter {
    constructor() {
        super();

        this._startPingTimesWorker();
        this._startTelemUploadRateWorker();
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
}

/** Convert a request response to a protobuf message object. */
function _parseMessage(err, resp, message) {
    // If we don't have a 2xx response code, return null.
    if (err || !(/^2/.test('' + resp.statusCode))) {
        return null;
    } else {
        let buffer = resp.body;

        return message.deserializeBinary(buffer.buffer.slice(
            buffer.byteOffset, buffer.byteOffset + buffer.byteLength
        ));
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
            data = message.getListList().sort((a, b) =>
                a.getHost() !== b.getHost() ? a.getHost() > b.getHost() :
                                              a.getPort() > b.getPort()
            ).map(time => [
                time.getOnline(), time.getName(), time.getHost(),
                time.getPort(), time.getMs()
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
        let message = _parseMessage(err, resp, InteropUploadRate);

        let available = message !== null;
        let rates;

        if (available) {
            rates = [
                message.getTotal1(), message.getTotal5(), message.getFresh1(),
                message.getFresh5()
            ];
        } else {
            rates = [0.0, 0.0, 0.0, 0.0];
        }

        cb({ rates, available });
    });
}
