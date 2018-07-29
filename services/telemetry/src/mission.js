/* Contains functions for receiving and sending missions. */

import _ from 'lodash';

import { telemetry } from './messages';

import { cleanupAfter } from './util';

const MISSION_TIMEOUT = 15000;

/**
 * Download a mission via MAVLink.
 *
 * To receive the mission, first, a MISSION_REQUEST_LIST message is
 * sent until the MISSION_COUNT message is received. Afterwards, each
 * second, a MISSION_REQUEST message is sent for each mission item
 * that has not been received yet. When a MISSION_ITEM message is
 * received, the mission item is registered. Once there are no more
 * remaining items to be fetched, the mission is returned in the
 * promise. After the promise is returned, a MISSION_ACK message is
 * sent to the aircraft, and is also sent again each time another
 * MISSION_ITEM is received until the next another mission receiving
 * transaction is started.
 *
 * Note that this function assumes no other transations are taking
 * place.
 *
 * @param {MavlinkSocket} mav
 * @returns {Promise<telemetry.RawMission>}
 */
export async function receiveMission(mav) {
  let mission = telemetry.RawMission.create();
  let itemsRemaining = [];

  let reqListInt;
  let reqItemInt;
  let onCount;
  let onItem;

  let cleanupObj = cleanupAfter(() => {
    clearInterval(reqListInt);
    clearInterval(reqItemInt);
    mav.removeListener('MISSION_COUNT', onCount);
    mav.removeListener('MISSION_ITEM', onItem);
  }, MISSION_TIMEOUT, 'mission receiving took too long');

  // Return the mission and respond with an ACK message after each
  // item until a mission is being received again and return the
  // mission.
  let complete = () => {
    cleanupObj.finish(undefined, mission);

    let onItemAfter = () => _sendMissionAck(mav);

    // Send an ACK immediately regardless.
    onItemAfter();

    mav.on('MISSION_ITEM', onItemAfter);

    // The next mission count message is the same as the count
    // received in the next receiveMission call.
    mav.once('MISSION_COUNT', () => {
      mav.removeListener('MISSION_ITEM', onItemAfter);
    });
  };

  // Request the list of mission items still remaining.
  let requestRemaining = () => {
    itemsRemaining.forEach(i => _sendMissionRequest(mav, i));
  };

  // Send the mission request list message repetitively.
  _sendMissionRequestList(mav);
  reqListInt = setInterval(() => _sendMissionRequestList(mav), 1000);

  // When a count message is received, create the mission object, the
  // list of remaining fields, and finish if the count is zero,
  // otherwise, start a task that requests the remaining items.
  onCount = (fields) => {
    let count = fields.count;

    mission.mission_items = Array(count).fill({});
    itemsRemaining = _.range(count);

    if (count === 0) {
      complete();
    } else {
      requestRemaining();
      reqItemInt = setInterval(requestRemaining, 1000);
    }
  };

  // For each item, check if it's remaining, and if it is, add it to
  // the mission item list and pop it off the remaining list.
  onItem = (fields) => {
    let id = fields.seq;
    let remainingIndex = itemsRemaining.indexOf(id);

    if (remainingIndex !== -1) {
      mission.mission_items[id] = _convertMavlinkMission(fields);
      itemsRemaining.splice(remainingIndex, 1);
    }

    if (itemsRemaining.length === 0) {
      complete();
    }
  };

  mav.once('MISSION_COUNT', onCount);
  mav.on('MISSION_ITEM', onItem);

  return await cleanupObj.wait();
}

/**
 * Upload a mission via MAVLink.
 *
 * If the mission contains an empty list of mission items, a mission
 * clear message is sent.
 *
 * To send the mission, first, a MISSION_COUNT message is sent until
 * requests for mission items are received. Afterwards, a mission
 * item is simply returned each time one is requested. Note that no
 * items are sent if they are not requested. The transaction ends
 * when a MISSION_ACK is received.
 *
 * Note that this function assumes no other transations are taking
 * place.
 *
 * @param {MavlinkSocket}        mav
 * @param {telemetry.RawMission} mission
 * @returns {Promise}
 */
export async function sendMission(mav, mission) {
  // If this is an empty list, clear the mission instead.
  if (!mission || mission.mission_items.length === 0) {
    await _clearAll(mav);
  } else {
    await _sendMission(mav, mission);
  }
}

async function _clearAll(mav) {
  let clearInt;
  let onAck;

  let cleanupObj = cleanupAfter(() => {
    clearInterval(clearInt);
    mav.removeListener('MISSION_ACK', onAck);
  }, MISSION_TIMEOUT, 'mission clearing took too long');

  // Send a clear message repetitively.
  _sendClearAll(mav);
  clearInt = setInterval(() => _sendClearAll(mav), 1000);

  // When the ACK comes, finish this exchange.
  onAck = _getAckHandler(cleanupObj);

  mav.once('MISSION_ACK', onAck);

  await cleanupObj.wait();
}

async function _sendMission(mav, mission) {
  let items = mission.mission_items;

  let countInt;
  let onFirstRequest;
  let onRequest;
  let onAck;

  let cleanupObj = cleanupAfter(() => {
    clearInterval(countInt);
    mav.removeListener('MISSION_REQUEST', onFirstRequest);
    mav.removeListener('MISSION_REQUEST', onRequest);
    mav.removeListener('MISSION_ACK', onAck);
  }, MISSION_TIMEOUT, 'mission sending took too long');

  // Send a count once, and then keep doing it on an interval if a
  // mission request hasn't come in yet.
  _sendCount(mav, items.length);
  countInt = setInterval(() => _sendCount(mav, items.length), 1000);

  // After the first request, stop the count interval.
  onFirstRequest = () => clearInterval(countInt);

  // On each request, send back the mission item that is requested.
  onRequest = fields => _sendMissionItem(mav, items[fields.seq]);

  // When the ACK comes, finish this exchange.
  onAck = _getAckHandler(cleanupObj);

  mav.once('MISSION_REQUEST', onFirstRequest);
  mav.on('MISSION_REQUEST', onRequest);
  mav.once('MISSION_ACK', onAck);

  await cleanupObj.wait();
}

async function _sendMissionRequestList(mav) {
  await mav.send('MISSION_REQUEST_LIST', {
    target_system: 1,
    target_component: 1,
    mission_type: 0
  });
}

async function _sendMissionRequest(mav, id) {
  await mav.send('MISSION_REQUEST', {
    target_system: 1,
    target_component: 1,
    seq: id,
    mission_type: 0
  });
}

async function _sendMissionAck(mav) {
  await mav.send('MISSION_ACK', {
    target_system: 1,
    target_component: 1,
    type: 0,
    mission_type: 0
  });
}

async function _sendClearAll(mav) {
  await mav.send('MISSION_CLEAR_ALL', {
    target_system: 1,
    target_component: 1,
    mission_type: 255
  });
}

async function _sendCount(mav, count) {
  await mav.send('MISSION_COUNT', {
    target_system: 1,
    target_component: 1,
    count: count,
    mission_type: 0
  });
}

async function _sendMissionItem(mav, item) {
  await mav.send('MISSION_ITEM', _convertProtoMission(item));
}

// Return a handler that finishes with an error on a bad ACK message.
function _getAckHandler(cleanupObj) {
  return (fields) => {
    if (fields.type === 0) {
      cleanupObj.finish();
    } else {
      let err = Error('MISSION_ACK returned CMD ID ' + fields.type);
      cleanupObj.finish(err);
    }
  };
}

function _convertMavlinkMission(fields) {
  let itemCopy = JSON.parse(JSON.stringify(fields));

  itemCopy.param_1 = itemCopy.param1;
  itemCopy.param_2 = itemCopy.param2;
  itemCopy.param_3 = itemCopy.param3;
  itemCopy.param_4 = itemCopy.param4;

  return itemCopy;
}

function _convertProtoMission(mission) {
  let itemCopy = JSON.parse(JSON.stringify(mission));

  itemCopy.param1 = itemCopy.param_1;
  itemCopy.param2 = itemCopy.param_2;
  itemCopy.param3 = itemCopy.param_3;
  itemCopy.param4 = itemCopy.param_4;

  return itemCopy;
}
