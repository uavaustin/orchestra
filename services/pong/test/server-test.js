const assert = require('chai').assert;
const express = require('express');
const request = require('request');

const { PingTimes } = require('../lib/messages/stats_pb');

before(function (done) {
    // Creating several test servers.
    let aliveEndpointApp = express();
    let customEndpointApp = express();
    let noEndpointApp = express();

    aliveEndpointApp.get('/api/alive', (req, res) => res.send('test1'));
    customEndpointApp.get('/custom', (req, res) => res.send('test2'));

    this.aliveEndpointServer = aliveEndpointApp.listen(7001);
    this.customEndpointServer = customEndpointApp.listen(7002);
    this.noEndpointServer = noEndpointApp.listen(7003);

    process.argv.push('test1,127.0.0.1:7001');
    process.argv.push('test2,127.0.0.1:7002,/custom');
    process.argv.push('no-endpoint,127.0.0.1:7003')
    process.argv.push('non-existent,127.0.0.1');
    process.argv.push('meta,127.0.0.1:7000');

    // Allowing a little time to get things up and running.
    setTimeout(() => {
        this.server = require('..').server;
        done();
    }, 100);
});

describe('GET /api/ping', function () {
    it('should check the protobuf response (default)', function (done) {
        request.get({
            uri: 'http://127.0.0.1:7000/api/ping',
            encoding: null 
        }, (err, res, buffer) => {
            if (err) {
                done(err);
                return;
            }

            assert.equal(res.headers['content-type'],
                    'application/x-protobuf');

            let msg = PingTimes.deserializeBinary(
                buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset
                        + buffer.byteLength)
            )

            let list = msg.getListList();

            assert.equal(list[0].getName(), 'meta');
            assert.equal(list[0].getHost(), '127.0.0.1');
            assert.equal(list[0].getPort(), '7000');
            assert.equal(list[0].getOnline(), true);
            assert(list[0].getMs() > 0);
            assert(list[0].getMs() < 1000);

            assert.equal(list[1].getName(), 'no-endpoint');
            assert.equal(list[1].getHost(), '127.0.0.1');
            assert.equal(list[1].getPort(), '7003');
            assert.equal(list[1].getOnline(), false);
            assert.equal(list[1].getMs(), 0);

            assert.equal(list[2].getName(), 'non-existent');
            assert.equal(list[2].getHost(), '127.0.0.1');
            assert.equal(list[2].getPort(), '80');
            assert.equal(list[2].getOnline(), false);
            assert.equal(list[2].getMs(), 0);

            assert.equal(list[3].getName(), 'test1');
            assert.equal(list[3].getHost(), '127.0.0.1');
            assert.equal(list[3].getPort(), '7001');
            assert.equal(list[3].getOnline(), true);
            assert(list[3].getMs() > 0);
            assert(list[3].getMs() < 1000);

            assert.equal(list[4].getName(), 'test2');
            assert.equal(list[4].getHost(), '127.0.0.1');
            assert.equal(list[4].getPort(), '7002');
            assert.equal(list[4].getOnline(), true);
            assert(list[4].getMs() > 0);
            assert(list[4].getMs() < 1000);

            done();
        });
    });

    it('should return JSON if desired', function (done) {
        request.get({
            uri: 'http://127.0.0.1:7000/api/ping',
            headers: {
                'accept': 'application/json'
            },
            json: true
        }, (err, res, body) => {
            if (err) {
                done(err);
                return;
            }

            assert.equal(typeof body, 'object');
            assert.equal(typeof body.time, 'number');

            let list = body.listList;

            assert.equal(list[0].name, 'meta');
            assert.equal(list[0].host, '127.0.0.1');
            assert.equal(list[0].port, '7000');
            assert.equal(list[0].online, true);
            assert.equal(typeof list[0].ms, 'number');
            assert(list[0].ms > 0);
            assert(list[0].ms < 1000);

            assert.equal(list[1].name, 'no-endpoint');
            assert.equal(list[1].host, '127.0.0.1');
            assert.equal(list[1].port, '7003');
            assert.equal(list[1].online, false);
            assert.equal(list[1].ms, 0);

            assert.equal(list[2].name, 'non-existent');
            assert.equal(list[2].host, '127.0.0.1');
            assert.equal(list[2].port, '80');
            assert.equal(list[2].online, false);
            assert.equal(list[2].ms, 0);

            assert.equal(list[3].name, 'test1');
            assert.equal(list[3].host, '127.0.0.1');
            assert.equal(list[3].port, '7001');
            assert.equal(list[3].online, true);
            assert.equal(typeof list[3].ms, 'number');
            assert(list[3].ms > 0);
            assert(list[3].ms < 1000);

            assert.equal(list[4].name, 'test2');
            assert.equal(list[4].host, '127.0.0.1');
            assert.equal(list[4].port, '7002');
            assert.equal(list[4].online, true);
            assert.equal(typeof list[4].ms, 'number');
            assert(list[4].ms > 0);
            assert(list[4].ms < 1000);

            done();
        });
    });
});

after(function () {
    this.aliveEndpointServer.close();
    this.customEndpointServer.close();
    this.noEndpointServer.close();
    this.server.close();
});
