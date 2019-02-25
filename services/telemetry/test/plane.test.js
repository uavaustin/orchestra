import Plane from '../src/plane';
import logger from '../src/common/logger';

let plane;

beforeAll(() => {
  plane = new Plane({ host: 'localhost', port: 9999 });
});

test('log unknown message', async () => {
  const msgName = 'HIGH_LATENCY';
  const originalLoggerDebug = logger.debug;
  let onUnknownMessage = jest.fn().mockImplementation(() => {});
  const spy = jest.spyOn(logger, 'debug').mockImplementation((msg) => {
    if (msg.includes(msgName))
      onUnknownMessage();
    originalLoggerDebug(msg);
  });

  plane._mav.emit('message', { type: msgName });
  await new Promise((resolve) => setTimeout(resolve, 50));
  expect(onUnknownMessage).toHaveBeenCalled();

  spy.mockRestore();
});
