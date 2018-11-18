import lolex from 'lolex';

import UploadMonitor from '../src/upload-monitor';

test('can create an upload monitor', () => {
  let monitor = new UploadMonitor();

  expect(monitor).toBeTruthy();
});

test('rates change when telemetry is added', () => {
  let monitor = new UploadMonitor();
  let clock = lolex.install();

  let rate1 = monitor.getUploadRate();

  expect(rate1.time).toBe(0);
  expect(rate1.total_1).toBe(0);
  expect(rate1.fresh_1).toBe(0);
  expect(rate1.total_5).toBe(0);
  expect(rate1.fresh_5).toBe(0);

  monitor.addTelem({ lat: 1, lon: 2, alt_msl: 3, yaw: 4 });

  let rate2 = monitor.getUploadRate();

  expect(rate2.time).toBe(0);
  expect(rate2.total_1).toBe(1);
  expect(rate2.fresh_1).toBe(1);
  expect(rate2.total_5).toBe(0.2);
  expect(rate2.fresh_5).toBe(0.2);

  clock.uninstall();
});

test('fresh telemetry is counted for both rates', () => {
  let monitor = new UploadMonitor();
  let clock = lolex.install();

  monitor.addTelem({ lat: 1, lon: 2, alt_msl: 3, yaw: 4 });
  monitor.addTelem({ lat: 1, lon: 2, alt_msl: 5, yaw: 4 });

  let rate = monitor.getUploadRate();

  expect(rate.time).toBe(0);
  expect(rate.total_1).toBe(2);
  expect(rate.fresh_1).toBe(2);
  expect(rate.total_5).toBe(0.4);
  expect(rate.fresh_5).toBe(0.4);

  clock.uninstall();
});

test('stale telemetry does not affect fresh rate', () => {
  let monitor = new UploadMonitor();
  let clock = lolex.install();

  monitor.addTelem({ lat: 1, lon: 2, alt_msl: 3, yaw: 4 });
  monitor.addTelem({ lat: 1, lon: 2, alt_msl: 3, yaw: 4 });

  let rate = monitor.getUploadRate();

  expect(rate.time).toBe(0);
  expect(rate.total_1).toBe(2);
  expect(rate.fresh_1).toBe(1);
  expect(rate.total_5).toBe(0.4);
  expect(rate.fresh_5).toBe(0.2);

  clock.uninstall();
});

test('telemetry expires after 1 or 5 seconds', () => {
  let monitor = new UploadMonitor();
  let clock = lolex.install();

  monitor.addTelem({ lat: 1, lon: 2, alt_msl: 3, yaw: 4 });

  let rate1 = monitor.getUploadRate();

  expect(rate1.time).toBe(0);
  expect(rate1.total_1).toBe(1);
  expect(rate1.fresh_1).toBe(1);
  expect(rate1.total_5).toBe(0.2);
  expect(rate1.fresh_5).toBe(0.2);

  clock.tick(999);

  let rate2 = monitor.getUploadRate();

  expect(rate2.time).toBe(0.999);
  expect(rate2.total_1).toBe(1);
  expect(rate2.fresh_1).toBe(1);
  expect(rate2.total_5).toBe(0.2);
  expect(rate2.fresh_5).toBe(0.2);

  clock.tick(1);

  let rate3 = monitor.getUploadRate();

  expect(rate3.time).toBe(1);
  expect(rate3.total_1).toBe(0);
  expect(rate3.fresh_1).toBe(0);
  expect(rate3.total_5).toBe(0.2);
  expect(rate3.fresh_5).toBe(0.2);

  clock.tick(3999);

  let rate4 = monitor.getUploadRate();

  expect(rate4.time).toBe(4.999);
  expect(rate4.total_1).toBe(0);
  expect(rate4.fresh_1).toBe(0);
  expect(rate4.total_5).toBe(0.2);
  expect(rate4.fresh_5).toBe(0.2);

  clock.tick(1);

  let rate5 = monitor.getUploadRate();

  expect(rate5.time).toBe(5);
  expect(rate5.total_1).toBe(0);
  expect(rate5.fresh_1).toBe(0);
  expect(rate5.total_5).toBe(0);
  expect(rate5.fresh_5).toBe(0);

  clock.uninstall();
});
