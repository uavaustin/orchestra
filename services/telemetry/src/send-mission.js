import { sendMavMessage, wait } from './util';

const MAX_COUNT_ATTEMPTS = 10;
const MISSION_TIMEOUT = 10000;

export default async function sendMission(mav, mission, socket, host, port) {
    // If this is an empty list, we're just going to clear the
    // mission, otherwise, the the normal mission sending operation
    // won't work.
    if (!mission || mission.length === 0) {
        return await _sendClearAll(mav, socket, host, port);
    }

    let countAttempts = 0;

    // Keep trying to send the count message until it works, or if we
    // have to try too many times.
    while (true) {
        try {
            await _sendCount(mav, mission.length, socket, host, port);
            break;
        } catch (err) {
            countAttempts++;

            if (countAttempts === MAX_COUNT_ATTEMPTS) {
                throw Error('Maximum number of MISSION_COUNT messages sent.');
            }

            await wait(1000);
        }
    }


    // On each request, send back the mission item that is requested.
    let onRequest = async (msg, fields) => {
        await _sendMissionItem(mav, mission[fields.seq], socket, host, port);
    };

    let finish;
    let earlySuccess = false;

    // We're done on the ACK message, so clean up.
    let onAck = (msg, fields) => {
        mav.removeListener('MISSION_REQUEST', onRequest);

        earlySuccess = true;
        if (finish) finish();
    };

    mav.on('MISSION_REQUEST', onRequest);
    mav.once('MISSION_ACK', onAck);

    // If we hit the max time, we'll kill the listeners and reject,
    // otherwise, cleanup the timeout the resolve.
    return await new Promise((resolve, reject) => {
        let waitTimeout = setTimeout(() => {
            mav.removeListener('MISSION_REQUEST', onRequest);
            mav.removeListener('MISSION_ACK', onAck);
            reject(Error('Mission sending took too long.'));
        }, MISSION_TIMEOUT);

        finish = () => {
            clearTimeout(waitTimeout);
            resolve();
        };

        if (earlySuccess) finish();
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
