import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs-extra';

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
  await fs.writeFile('/tmp/temp.jpg', image);
  await promisify(exec)('exiv2 -M "del Exif.Image.Orientation" '
    + 'modify /tmp/temp.jpg');
  let newImage = await fs.readFile('/tmp/temp.jpg');
  await fs.unlink('/tmp/temp.jpg');
  return newImage;
}

async function imageToBuffer(gmImage) {
  return await promisify(gmImage.toBuffer.bind(gmImage))('JPEG');
}
