/**
 * Sends a Protobuf message or its JSON representation,
 * based on whether or not the request's Accept header
 * is `application/json`.
 */
export function sendJsonOrProto(req, res, proto) {
    const accept = req.get('accept');

    if (accept === undefined || !accept.startsWith('application/json')) {
        res.set('content-type', 'application/x-protobuf');
        res.send(proto.constructor.encode(proto).finish());
    } else {
        res.send(proto.constructor.toObject(proto));
    }
}

/**
 * Returns a Python-like remainder.
 * https://stackoverflow.com/a/3417242
 */
export function wrapIndex(i, i_max) {
    return ((i % i_max) + i_max) % i_max;
}

export async function sendMavMessage(mav, msg, fields, socket, host, port) {
    return await new Promise((resolve, reject) => {
        mav.createMessage(msg, fields, (msg) => {
            socket.send(msg.buffer, port, host, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
    });
}

/** Wait for an amount of time. */
export async function wait(milliseconds) {
    return await (new Promise(resolve => setTimeout(resolve, milliseconds)));
}
