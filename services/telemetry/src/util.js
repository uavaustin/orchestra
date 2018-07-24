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

/** Return a object that can be used for cleanup in timeouts. */
export function cleanupAfter(cleanup, limit, message) {
    let timeoutMessage = message || 'operation timed out';

    let earlyCall = false;
    let earlyErr = null;

    // Store if there was an error or not in the case that the finish
    // function is called before it is overrided below.
    let finish = (err) => {
        earlyCall = true;
        earlyErr = err;
    };

    // Resolves after the cleanup is finished.
    let done = new Promise((resolve, reject) => {
        // Call the finish function if the timeout is reached.
        let waitTimeout = setTimeout(() => {
            finish(Error(timeoutMessage));
        }, limit);

        // Cancel the timeout, cleanup, and mark the operation as
        // complete.
        finish = (err, result) => {
            clearTimeout(waitTimeout);
            cleanup();

            if (err) reject(err);
            else resolve(result);
        };

        if (earlyCall) finish(earlyErr);
    });

    // Async function to wait for the operation to be over and
    // cleaned up.
    let wait = async () => await done;

    return { finish, wait };
}
