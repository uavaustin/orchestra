import gphoto2 from 'gphoto2';
import _ from 'lodash';
import nock from 'nock';

import logger from '../src/common/logger';

import Service from '../src/service';

gphoto2.GPhoto2 = jest.fn(() => {
  return { list: jest.fn((cb => cb([{ }]))) };
});

nock('http://camera:1234')
  .defaultReplyHeaders({ 'content-type': 'application/json' })
  .get('/ctrl/session')
  .reply(200, { code: 0, desc: '', msg: '' })
  .get('/ctrl/session?action=quit')
  .reply(200, { code: 0, desc: '', msg: '' });

const names = ['gphoto2', 'z-cam-e1', 'file', 'sync'];
const options = [
  { port: 8081, backend: 'gphoto2', telemetryHost: 'telemetry',
    telemetryPort: 5000, captureInterval: 4000 },
  { port: 8081, backend: 'z-cam-e1', cameraHost: 'camera', cameraPort: 1234,
    telemetryHost: 'telemetry', telemetryPort: 5000, captureInterval: 4000 },
  { port: 8081, backend: 'file' },
  { port: 8081, backend: 'sync', imagerySyncHost: 'imagery',
    imagerySyncPort: 8082 }
];

// These tests just check to see if the service can start.
test.each(_.zip(names, options))(
  'start %s backend',
  async (_name, options) => {
    const service = new Service(options);

    // The backends will fail since the camera, telemetry source,
    // and sync backend don't actually exist.
    logger.transports[0].silent = true;

    await service.start();
    await service.stop();

    logger.transports[0].silent = false;
  }
);
