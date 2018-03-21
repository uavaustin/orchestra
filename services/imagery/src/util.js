import gm from 'gm';

/** Convert a Buffer to a Uint8Array for protobuf message objects. */
export function toUint8Array(buffer) {
    return new Uint8Array(buffer.buffer.slice(
        buffer.byteOffset, buffer.byteOffset + buffer.byteLength
    ));
}

/** Wait for an amount of time. */
export async function wait(milliseconds) {
    return await (new Promise(resolve => setTimeout(resolve, milliseconds)));
}

/** Convert a JPEG buffer to a PNG. */
export async function convertJpeg(image) {
    return await (new Promise((resolve, reject) => {
        gm(image, 'image.jpeg').toBuffer('PNG', (err, buffer) => {
            if (err) reject(err);
            else resolve(buffer);
        });
    }));
}
