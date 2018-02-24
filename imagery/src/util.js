/* Convert a Buffer to a Uint8Array for protobuf message objects. */
export function toUint8Array(buffer) {
    return buffer.buffer.slice(
        buffer.byteOffset, buffer.byteOffset + buffer.byteLength
    );
}
