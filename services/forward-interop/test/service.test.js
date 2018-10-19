import nock from 'nock';

import logger from '../src/common/logger';
import { interop } from '../src/messages';

import Service from '../src/service';

let t1 = interop.InteropTelem.encode({
  time: 1, pos: { lat: 2, lon: 3, alt_msl: 4 }, yaw: 5
}).finish();
let t2 = interop.InteropTelem.encode({
  time: 2, pos: { lat: 3, lon: 4, alt_msl: 5 }, yaw: 6
}).finish();

let m1 = interop.InteropMessage.encode({
  time: 1, text: 'test 1'
}).finish();
let m2 = interop.InteropMessage.encode({
  time: 2, text: 'test 2'
}).finish();

test('telemetry data is forwarded to interop-proxy', async () => {
  let service = new Service({
    port: 4000,
    uploadInterval: 300,
    telemetryHost: 'telemetry-test',
    telemetryPort: 5000,
    interopProxyHost: 'interop-proxy-test',
    interopProxyPort: 8000
  });

  let telemetryApi = nock('http://telemetry-test:5000')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/interop-telem')
    .reply(200, t1)
    .get('/api/interop-telem')
    .reply(200, t2);

  let interopProxyApi = nock('http://interop-proxy-test:8000')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .post('/api/telemetry', t1)
    .reply(200, m1)
    .post('/api/telemetry', t2)
    .reply(200, m2);

  try {
    await service.start();

    // Give enough time for two forward operations.
    await new Promise(resolve =>
      setTimeout(resolve, 3*service._uploadInterval));

    telemetryApi.done();
    interopProxyApi.done();
  } finally {
    await service.stop();
  }
});

test('forward failures are recovered from', async () => {
  let service = new Service({
    port: 4000,
    uploadInterval: 300,
    telemetryHost: 'telemetry-test',
    telemetryPort: 5000,
    interopProxyHost: 'interop-proxy-test',
    interopProxyPort: 8000
  });

  let telemetryApi = nock('http://telemetry-test:5000')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/interop-telem')
    .reply(500)
    .get('/api/interop-telem')
    .reply(200, t2);

  let interopProxyApi = nock('http://interop-proxy-test:8000')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .post('/api/telemetry', t2)
    .reply(200, m2);

  try {
    await service.start();

    logger.transports[0].silent = true;

    // Give enough time for two forward operations.
    await new Promise(resolve =>
      setTimeout(resolve, 3*service._uploadInterval));

    logger.transports[0].silent = false;

    telemetryApi.done();
    interopProxyApi.done();
  } finally {
    await service.stop();
  }
});

test('last telemetry is uploaded when service is stopped', async () => {
  let service = new Service({
    port: 4000,
    uploadInterval: 300,
    telemetryHost: 'telemetry-test',
    telemetryPort: 5000,
    interopProxyHost: 'interop-proxy-test',
    interopProxyPort: 8000
  });

  let telemetryApi = nock('http://telemetry-test:5000')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .get('/api/interop-telem')
    .delay(750)
    .reply(200, t1);

  let interopProxyApi = nock('http://interop-proxy-test:8000')
    .defaultReplyHeaders({ 'content-type': 'application/x-protobuf' })
    .post('/api/telemetry', t1)
    .reply(200, m1);

  let didStop = false;

  try {
    await service.start();

    // Give enough time for the forward operation to be happening.
    await new Promise(resolve =>
      setTimeout(resolve, 3*service._uploadInterval));

    await service.stop();

    didStop = true;

    // Give enough time for the operation to finish.
    await new Promise(resolve =>
      setTimeout(resolve, 3*service._uploadInterval));

    telemetryApi.done();
    interopProxyApi.done();
  } finally {
    if (!didStop) {
      await service.stop();
    }
  }
});
