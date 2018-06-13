const expect = require('chai').expect;
const request = require('request');

const RawMission = require('../lib/messages').telemetry.RawMission;

describe('Missions', function () {
    const rawMissionCount = 3;

    // Basic checks if the lengths are the same after retreiving a
    // posted mission.
    for (let i = 1; i <= rawMissionCount; i++) {
        let rawMissionProto;
        let rawMissionObj;

        describe(`Raw Mission ${i}`, function () {
            this.timeout(10000);

            before(function() {
                rawMissionObj = require(`./data/test-raw-mission-${i}.json`);
                rawMissionProto = RawMission.fromObject(rawMissionObj);
            });

            it(`should upload raw mission ${i} as a protobuf`,
                    function (done) {
                let encoded = RawMission.encode(rawMissionProto).finish();

                request.post({
                    uri: 'http://localhost:5000/api/raw-mission',
                    headers: {
                        'content-type': 'application/x-protobuf',
                        // Manually setting the content length, since
                        // if an empty protobuf is sent, it'll give
                        // an argument error and won't set the
                        // content length.
                        'content-length': encoded.length
                    },
                    timeout: 10000,
                    body: encoded
                }, (err, res) => {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    done();
                });
            });

            it(`should download raw mission ${i} as JSON`, function (done) {
                request.get({
                    uri: 'http://localhost:5000/api/raw-mission',
                    headers: {
                        'accept': 'application/json'
                    },
                    timeout: 10000
                }, (err, res) => {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);

                    let mission = RawMission.fromObject(JSON.parse(res.body));

                    expect(mission.mission_items.length)
                        .to.equal(rawMissionObj.mission_items.length);
                    done();
                });
            });

            it(`should upload raw mission ${i} as JSON`, function (done) {
                request.post({
                    uri: 'http://localhost:5000/api/raw-mission',
                    timeout: 10000,
                    json: rawMissionObj
                }, (err, res) => {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);
                    done();
                });
            });

            it(`should download raw mission ${i} as a protobuf`,
                    function (done) {
                request.get({
                    uri: 'http://localhost:5000/api/raw-mission',
                    headers: {
                        'accept': 'application/x-protobuf'
                    },
                    encoding: null,
                    timeout: 10000
                }, (err, res) => {
                    expect(err).to.equal(null);
                    expect(res.statusCode).to.equal(200);

                    let mission = RawMission.decode(res.body);

                    expect(mission.mission_items.length)
                        .to.equal(rawMissionObj.mission_items.length);
                    done();
                });
            });
        });
    }
});
