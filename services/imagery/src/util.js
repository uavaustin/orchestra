import gm from 'gm';

/** Wait for an amount of time. */
export async function wait(milliseconds) {
    return await (new Promise(resolve => setTimeout(resolve, milliseconds)));
}

/** Convert a PNG buffer to a JPEG. */
export async function convertPng(image) {
    return await (new Promise((resolve, reject) => {
        gm(image, 'image.png').toBuffer('JPEG', (err, buffer) => {
            if (err) reject(err);
            else resolve(buffer);
        });
    }));
}

/** Take EXIF data off of an image. */
export async function removeExif(image) {
    return await (new Promise((resolve, reject) => {
        gm(image, 'image.jpg').noProfile().toBuffer('JPEG', (err, buffer) => {
            if (err) reject(err);
            else resolve(buffer);
        });
    }));
}
