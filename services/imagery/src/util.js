import { promisify } from 'util';

import gm from 'gm';

/** Wait for an amount of time. */
export async function wait(milliseconds) {
  return await new Promise(resolve => setTimeout(resolve, milliseconds));
}

/** Convert a PNG buffer to a JPEG. */
export async function convertPng(image) {
  return await imageToBuffer(gm(image, 'image.png'));
}

/** Take EXIF data off of an image. */
export async function removeExif(image) {
  return await imageToBuffer(gm(image, 'image.jpg').noProfile());
}

async function imageToBuffer(gmImage) {
  return await promisify(gmImage.toBuffer.bind(gmImage))('JPEG');
}
