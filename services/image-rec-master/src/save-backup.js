import path from 'path';
import fs from 'fs-extra';

const BACKUP_FOLDER = '/found';

let num = 0;

/** Save a backup of the odlc in the interop server's format. */
export default async function saveBackup(odlc) {
    num++;

    let filename = path.join(BACKUP_FOLDER, `${num}.json`);
    let filenameImage = path.join(BACKUP_FOLDER, `${num}.jpg`);

    let interopOdlc;
    let image;

    if (odlc.type.toLowerCase() === 'emergent') {
        interopOdlc = _convertEmergentOdlc(odlc);
    } else {
        interopOdlc = _convertOdlc(odlc);
    }

    image = odlc.image;

    await fs.writeFile(filename, JSON.stringify(interopOdlc, null, 2));
    await fs.writeFile(filenameImage, image, { encoding: null });
}

function _convertOdlc(odlc) {
    return {
        type: odlc.type.toLowerCase(),
        latitude: odlc.pos.lat,
        longitude: odlc.pos.lon,
        orientation: _convertOrientation(odlc.orientation),
        shape: _convertShape(odlc.shape),
        background_color: _convertColor(odlc.background_color),
        alphanumeric: odlc.alphanumeric,
        alphanumeric_color: odlc.alphanumeric_color,
        autonomous: odlc.autonomous
    };
}

function _convertEmergentOdlc(odlc) {
    return {
        type: odlc.type.toLowerCase(),
        latitude: odlc.pos.lat,
        longitude: odlc.pos.lon,
        description: odlc.description,
        autonomous: odlc.autonomous
    };
}

function _convertOrientation(orientation) {
    switch (orientation) {
        case 'NORTH':
            return 'n';
        case 'NORTHEAST':
            return 'ne';
        case 'EAST':
            return 'e';
        case 'SOUTHEAST':
            return 'se';
        case 'SOUTH':
            return 's';
        case 'SOUTHWEST':
            return 'sw';
        case 'WEST':
            return 'w';
        case 'NORTHWEST':
            return 'nw';
        default:
            return null;
    }
}

function _convertShape(shape) {
    if (shape === 'UNKNOWN_SHAPE') {
        return null;
    } else {
        return shape.toLowerCase();
    }
}

function _convertColor(shape) {
    if (shape === 'UNKNOWN_COLOR') {
        return null;
    } else {
        return shape.toLowerCase();
    }
}
