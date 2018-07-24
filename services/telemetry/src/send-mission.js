import { cleanupAfter, sendMavMessage } from './util';

const MISSION_TIMEOUT = 15000;

export default async function sendMission(mav, mission, socket, host, port) {
    // If this is an empty list, clear the mission instead.
    if (!mission || mission.length === 0) {
        await _clearAll(mav, socket, host, port);
    } else {
        await _sendMission(mav, mission, socket, host, port);
    }
}

async function _clearAll(mav, socket, host, port) {
    let clearInt;
    let onAck;

    let cleanupObj = cleanupAfter(() => {
        clearInterval(clearInt);
        mav.removeListener('MISSION_ACK', onAck);
    }, MISSION_TIMEOUT, 'mission clearing took too long');

    let clear = () => _sendClearAll(mav, socket, host, port);

    // Send a clear message repetitively.
    clear();
    clearInt = setInterval(clear, 1000);

    // When the ACK comes, finish this exchange.
    onAck = _getAckHandler(cleanupObj);

    mav.once('MISSION_ACK', onAck);

    await cleanupObj.wait();
}

async function _sendMission(mav, mission, socket, host, port) {
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

    let sendCount = () => _sendCount(mav, mission.length, socket, host, port);

    // Send a count once, and then keep doing it on an interval if a
    // mission request hasn't come in yet.
    sendCount();
    countInt = setInterval(sendCount, 1000);

    // After the first request, stop the count interval.
    onFirstRequest = (msg, fields) => clearInterval(countInt);

    // On each request, send back the mission item that is requested.
    onRequest = (msg, fields) => {
        _sendMissionItem(mav, mission[fields.seq], socket, host, port);
    };

    // When the ACK comes, finish this exchange.
    onAck = _getAckHandler(cleanupObj);

    mav.once('MISSION_REQUEST', onFirstRequest);
    mav.on('MISSION_REQUEST', onRequest);
    mav.once('MISSION_ACK', onAck);

    await cleanupObj.wait();
}

async function _sendClearAll(mav, socket, host, port) {
    await sendMavMessage(mav, 'MISSION_CLEAR_ALL', {
        target_system: 1,
        target_component: 1,
        mission_type: 255
    }, socket, host, port);
}

async function _sendCount(mav, count, socket, host, port) {
    await sendMavMessage(mav, 'MISSION_COUNT', {
        target_system: 1,
        target_component: 1,
        count: count,
        mission_type: 0
    }, socket, host, port);
}

async function _sendMissionItem(mav, item, socket, host, port) {
    let itemCopy = JSON.parse(JSON.stringify(item));

    itemCopy.param1 = itemCopy.param_1;
    itemCopy.param2 = itemCopy.param_2;
    itemCopy.param3 = itemCopy.param_3;
    itemCopy.param4 = itemCopy.param_4;

    await sendMavMessage(mav, 'MISSION_ITEM', itemCopy, socket, host, port);
}

// Return a handler that finishes with an error on a bad ACK message.
function _getAckHandler(cleanupObj) {
    return (msg, fields) => {
        if (fields.type === 0) {
            cleanupObj.finish();
        } else {
            let err = Error('MISSION_ACK returned CMD ID ' + fields.type);
            cleanupObj.finish(err);
        }
    }
}
