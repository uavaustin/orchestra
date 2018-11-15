import _ from 'lodash';

import logger from '../src/common/logger';

import Service from '../src/service';

const names = ['gphoto2', 'file', 'sync'];
const options = [
  { port: 8081, backend: 'gphoto2', telemetryHost: 'telemetry',
    telemetryPort: 5000, captureInterval: 4000 },
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
