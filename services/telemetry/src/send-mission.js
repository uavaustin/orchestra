import { cleanupAfter } from './util';

const MISSION_TIMEOUT = 15000;

export default async function sendMission(mav, mission) {
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
    _sendCount(mav, items.length)
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
    }
}

function _convertProtoMission(mission) {
    let itemCopy = JSON.parse(JSON.stringify(mission));

    itemCopy.param1 = itemCopy.param_1;
    itemCopy.param2 = itemCopy.param_2;
    itemCopy.param3 = itemCopy.param_3;
    itemCopy.param4 = itemCopy.param_4;

    return itemCopy;
}
