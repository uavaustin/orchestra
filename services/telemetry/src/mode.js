import logger from './common/logger';

const mode_mapping_apm = {
  0: 'MANUAL',
  1: 'CIRCLE',
  2: 'STABILIZE',
  3: 'TRAINING',
  4: 'ACRO',
  5: 'FBWA',
  6: 'FBWB',
  7: 'CRUISE',
  8: 'AUTOTUNE',
  10: 'AUTO',
  11: 'RTL',
  12: 'LOITER',
  14: 'LAND',
  15: 'GUIDED',
  16: 'INITIALISING',
  17: 'QSTABILIZE',
  18: 'QHOVER',
  19: 'QLOITER',
  20: 'QLAND',
  21: 'QRTL',
  22: 'QAUTOTUNE'
};

let unknownWarn = true;

const MAV_TYPE_FIXED_WING = 1;
const MAV_AUTOPILOT_ARDUPILOTMEGA = 3;

export function onHeartbeat(fields) {

  let ov = this._overview;
  ov.time = Date.now() / 1000;

  if (fields.type == MAV_TYPE_FIXED_WING &&
    fields.autopilot == MAV_AUTOPILOT_ARDUPILOTMEGA) {
    ov.mode = mode_mapping_apm[fields.custom_mode];
  } else if (unknownWarn) {
    unknownWarn = false;
    if (fields.type !== MAV_TYPE_FIXED_WING)
      logger.warn(`Unknown autopilot ${fields.autopilot}`);
    if (fields.autopilot !== MAV_AUTOPILOT_ARDUPILOTMEGA)
      logger.warn(`Unknown vehicle type ${fields.type}`);
  }
}
