import logger from './common/logger';
import _ from 'lodash';
import { cleanupAfter } from './util';

const MODE_TIMEOUT = 15000;

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

const nameMappingAPM = _.invert(mode_mapping_apm);

let unknownWarn = true;

const MAV_TYPE_FIXED_WING = 1;
const MAV_AUTOPILOT_ARDUPILOTMEGA = 3;
const MAV_CMD_DO_SET_MODE = 176;
const MAV_RESULT_ACCEPTED = 0;
const MAV_RESULT_TEMPORARILY_REJECTED = 1;
const MAV_RESULT_IN_PROGRESS = 5;

export function onHeartbeat(fields) {

  let ov = this._overview;
  ov.time = Date.now() / 1000;

  if (fields.type == MAV_TYPE_FIXED_WING &&
    fields.autopilot == MAV_AUTOPILOT_ARDUPILOTMEGA) {
    ov.mode.name = mode_mapping_apm[fields.custom_mode];
  } else if (unknownWarn) {
    unknownWarn = false;
    if (fields.type !== MAV_TYPE_FIXED_WING)
      logger.warn(`Unknown autopilot ${fields.autopilot}`);
    if (fields.autopilot !== MAV_AUTOPILOT_ARDUPILOTMEGA)
      logger.warn(`Unknown vehicle type ${fields.type}`);
  }
}

export async function sendMode(mav, mode) {
  let modeNumber = nameMappingAPM[mode.name];

  if (modeNumber === undefined) {
    throw new Error(`Invalid mode name ${mode.name}`);
  }

  let setCurrentInt;
  let onAck;

  let cleanupObj = cleanupAfter(() => {
    clearInterval(setCurrentInt);
    mav.removeListener('COMMAND_ACK', onAck);
  }, MODE_TIMEOUT, 'setting mode took too long');

  // Send a mode set current message repetitively.
  _sendCommandLong(mav, modeNumber, 0);
  let confirmation = 1;

  setCurrentInt = setInterval(() => {
    return _sendCommandLong(mav, modeNumber, confirmation++);
  }, 1000);

  onAck = (fields) => {
    if (fields.type !== MAV_CMD_DO_SET_MODE) {
      return;
    } else if (fields.result === MAV_RESULT_ACCEPTED) {
      cleanupObj.finish();
    } else if (fields.result === MAV_RESULT_TEMPORARILY_REJECTED
     || fields.result === MAV_RESULT_IN_PROGRESS) {
      return;
    } else {
      let err = Error('COMMAND_ACK returned CMD ID ' + fields.result);
      cleanupObj.finish(err);
    }
  };

  mav.on('COMMAND_ACK', onAck);

  await cleanupObj.wait();
}

async function _sendCommandLong(mav, modeNumber, confirmation) {
  await mav.send('COMMAND_LONG', {
    target_system: 1,
    target_component: 0,
    command: 'MAV_CMD_DO_SET_MODE',
    confirmation,
    param1: 0,
    param2: modeNumber
  });
}
