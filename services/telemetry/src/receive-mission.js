import _ from 'lodash';

import { telemetry } from './messages';

import { cleanupAfter } from './util';

const MISSION_TIMEOUT = 15000;

export default async function receiveMission(mav) {
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

    // When a count message is received, create the mission object,
    // the list of remaining fields, and finish if the count is zero,
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

    // For each item, check if it's remaining, and if it is, add it
    // to the mission item list and pop it off the remaining list.
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

function _convertMavlinkMission(fields) {
    let itemCopy = JSON.parse(JSON.stringify(fields));

    itemCopy.param_1 = itemCopy.param1;
    itemCopy.param_2 = itemCopy.param2;
    itemCopy.param_3 = itemCopy.param3;
    itemCopy.param_4 = itemCopy.param4;

    return itemCopy;
}
