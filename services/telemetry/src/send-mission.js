import { sendMavMessage } from './util';

const MISSION_TIMEOUT = 15000;

export default async function sendMission(mav, mission, socket, host, port) {
    // If this is an empty list, we're just going to clear the
    // mission, otherwise, then the normal mission sending operation
    // won't work.
    if (!mission || mission.length === 0) {
        return await _clearAll(mav, socket, host, port);
    }

    // Making a finish function that is overrided below to end this
    // function. By default, we'll store if there was an error or not
    // in the case that the function is called before it is overrided
    // below.
    let finish = function (err) {
        this.called = true;
        this.err = err
    };

    // Send a count once, and then keep doing it on an interval if a
    // mission request hasn't come in yet.
    let sendCount = () => _sendCount(mav, mission.length, socket, host, port);
    sendCount();

    let countInt = setInterval(sendCount, 1000);

    // After the first request, we don't need to send the count
    // anymore.
    let onFirstRequest = (msg, fields) => clearInterval(countInt);

    // On each request, send back the mission item that is requested.
    let onRequest = async (msg, fields) => {
        await _sendMissionItem(mav, mission[fields.seq], socket, host, port);
    };

    // We're done on the ACK message. A type of 0 means the mission
    // sending was successful.
    let onAck = (msg, fields) => {
        if (fields.type === 0) finish();
        else finish(Error('MISSION_ACK returned CMD ID ' + fields.type));
    };

    mav.once('MISSION_REQUEST', onFirstRequest);
    mav.on('MISSION_REQUEST', onRequest);
    mav.once('MISSION_ACK', onAck);

    // If we hit the max time, we'll finish this
    let waitTimeout = setTimeout(() => {
        finish(Error('Mission sending took too long.'));
    }, MISSION_TIMEOUT);

    return await new Promise((resolve, reject) => {
        let earlyCall = finish.called;
        let earlyErr = finish.err;

        finish = (err) => {
            clearInterval(countInt);
            clearTimeout(waitTimeout);

            mav.removeListener('MISSION_REQUEST', onFirstRequest);
            mav.removeListener('MISSION_REQUEST', onRequest);
            mav.removeListener('MISSION_ACK', onAck);

            if (err) reject(err);
            else resolve();
        };

        if (earlyCall) {
            finish(earlyErr);
        }
    });
}

async function _clearAll(mav, socket, host, port) {
    // Using a similar method as sendMission(...) above.
    let finish = function (err) {
        this.called = true;
        this.err = err
    };

    let clear = () => _sendClearAll(mav, socket, host, port);
    clear();

    let clearInt = setInterval(clear, 1000);

    let onAck = (msg, fields) => {
        if (fields.type === 0) finish();
        else finish(Error('MISSION_ACK returned CMD ID ' + fields.type));
    };

    mav.once('MISSION_ACK', onAck);

    let waitTimeout = setTimeout(() => {
        finish(Error('Mission clearing took too long.'));
    }, MISSION_TIMEOUT);

    return await new Promise((resolve, reject) => {
        let earlyCall = finish.called;
        let earlyErr = finish.err;

        finish = (err) => {
            clearInterval(clearInt);
            clearTimeout(waitTimeout);

            mav.removeListener('MISSION_ACK', onAck);

            if (err) reject(err);
            else resolve();
        };

        if (earlyCall) {
            finish(earlyErr);
        }
    });
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
