/** Convert a request response to a protobuf message object. */
export function parseMessage(err, resp, message) {
    // If we don't have a 2xx response code, return null.
    if (err || !(/^2/.test('' + resp.statusCode))) {
        return null;
    } else {
        return message.decode(resp.body);
    }
}

