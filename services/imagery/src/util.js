import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs-extra';
import tmp from 'tmp-promise';
import gm from 'gm';

/** Wait for an amount of time. */
export async function wait(milliseconds) {
  return await new Promise(resolve => setTimeout(resolve, milliseconds));
}

/** Convert a PNG buffer to a JPEG. */
export async function convertPng(image) {
  return await imageToBuffer(gm(image, 'image.png'));
}

/** Take orientation data off of an image. */
export async function removeOrientation(image) {
  const temp = await tmp.file();
  try {
    await fs.writeFile(temp.path, image);
    await promisify(exec)('exiv2 -M "del Exif.Image.Orientation" '
      + `modify ${temp.path}`);
    let newImage = await fs.readFile(temp.path);
    return newImage;
  } finally {
    temp.cleanup();
  }
}

async function imageToBuffer(gmImage) {
  return await promisify(gmImage.toBuffer.bind(gmImage))('JPEG');
}
