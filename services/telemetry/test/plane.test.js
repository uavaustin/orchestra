import Plane from '../src/plane';
import logger from '../src/common/logger';

let plane;

beforeAll(() => {
  plane = new Plane({ host: 'localhost', port: 9999 });
});

test('log unknown message', async () => {
  const msgName = 'HIGH_LATENCY';
  const originalLoggerDebug = logger.debug;

  let spy;
  await new Promise((resolve) => {
    spy = jest.spyOn(logger, 'debug').mockImplementation((msg) => {
      if (msg.includes(msgName))
        resolve();
      originalLoggerDebug(msg);
    });
    plane._mav.emit('ignored', msgName);
  });

  spy.mockRestore();
});
