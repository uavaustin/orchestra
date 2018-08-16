const expect = require('chai').expect;
const request = require('request');

const Telemetry = require('..');

// Make sure the server is up and running.
before(function (done) {
    this.server = new Telemetry();
    this.server.start();

    this.timeout(0);

    let retries = 0;

    function getStatus(cb) {
        request.get('http://localhost:5000/api/alive', {
            timeout: 60000
        }, (err, res) => {
            if (err) cb(err);
            else cb(undefined, res.statusCode);
        });
    }

    (function checkOnline() {
        if (retries > 20) {
            done(Error('server did not come online'));
            return;
        }

        getStatus((err, statusCode) => {
            if (statusCode === 200) {
                done();
            } else {
                retries++;
                setTimeout(checkOnline, 1000);
            }
        });
    })();
});

// Take down the server once the tests are done.
after(function (done) {
    this.server.stop()
        .then(() => done())
        .catch(() => done(Error('server did not stop')));
});
