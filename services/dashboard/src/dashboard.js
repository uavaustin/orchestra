/**
 * Terminal dashboard which shows the system status.
 *
 * This uses the blessed (and blessed-contrib) libraries to make a
 * somewhat-graphical terminal dashboard display.
 */

import blessed from 'blessed';
import contrib from 'blessed-contrib';
import chalk from 'chalk';
import _ from 'lodash';
import { sprintf } from 'sprintf-js';

import DataRetriever from './data-retriever';
import { sparkline, sparklineHeading } from './sparkline';

// The main screen object.
let screen = blessed.screen();

// The screen is set up in a 12x12 grid.
let grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

let dataRetriever = new DataRetriever();

// The ping table shows the output from the pong service. This
// differs from the built-in table in that we can specify a more
// custom header.
let pingTable = grid.set(6, 0, 6, 12, blessed.box, {
    label: 'Ping',
});

function setPingTableData(data) {
    // Making the header at the top, note the newlines are outside
    // the bold styling, this was causing major problems when it was
    // inside earlier.
    let header = '\n' + chalk.bold.green(sprintf(
        ' %-24s %-23s %-13s %s', 'Name:', 'Host:', 'Port:', 'Ping (ms):'
    )) + '\n\n';

    let lines;

    if (data !== undefined && data.length > 0) {
        lines = data.map((line) => {
            // If the service is offline, we print the line in red with
            // a dash for the ping. If the ping is 1s or above, we'll
            // print it in yellow. Otherwise, we'll normally print it in
            // green.
            if (!line[0]) {
                return chalk.bold.red(sprintf('  %-24s %-23s %-13d %-5s',
                        line[1], line[2], line[3], '-'));
            } else if (line[4] >= 1000) {
                return chalk.yellow(sprintf('  %-24s %-23s %-13d %-5d',
                        line[1], line[2], line[3], line[4]));
            } else {
                return chalk.green(sprintf('  %-24s %-23s %-13d %-5d',
                        line[1], line[2], line[3], line[4]));
            }
        }).join('\n');
    } else {
        // We just set the lines to red dashes when we don't have any
        // data.
        lines = chalk.bold.red(sprintf(
            '  %-24s %-23s %-13s %-5s\n', '-', '-', '-', '-'
        ));
    }

    pingTable.setContent(header + lines);
}

// Initially, we show that there isn't any ping data.
setPingTableData([]);

dataRetriever.on('ping-times', (data) => {
    setPingTableData(data);
    screen.render();
});

// The telemetry upload graph has the stats from forward interop.
// This is the rate at which telemetry is uploaded (over 1 and 5
// seconds), and the rate at which new telemetry is being uploaded as
// well, which excludes any stale or duplicated data that we're
// sending.
let telemUploadGraph = grid.set(0, 0, 6, 8, blessed.box, {
    label: 'Telemetry Uplink'
});

function setTelemUploadGraphData(data, available = true) {
    // The graph box is a 2x2 sparkline display with total telemetry
    // on the left and the fresh on the right.
    let leftWidth = Math.floor((telemUploadGraph.width - 8) / 2);
    let rightWidth = telemUploadGraph.width - 8 - leftWidth;

    let levels = [5.0, 4.0, 3.0, 2.0, 1.0, 0.001];
    let low = 3.0;
    let critical = 1.0;

    let leftStrs = [
        sparklineHeading(
            'Total (1s):', 'Hz', data[0], available, low, critical, leftWidth
        ),
        ' ' + sparkline(data[0], levels, low, critical, leftWidth),
        sparklineHeading(
            'Total (5s):', 'Hz', data[1], available, low, critical, leftWidth
        ),
        ' ' + sparkline(data[1], levels, low, critical, leftWidth)
    ];

    let rightStrs = [
        sparklineHeading(
            'Fresh (1s):', 'Hz', data[2], available, low, critical, rightWidth
        ),
        ' ' + sparkline(data[2], levels, low, critical, rightWidth),
        sparklineHeading(
            'Fresh (5s):', 'Hz', data[3], available, low, critical, rightWidth
        ),
        ' ' + sparkline(data[3], levels, low, critical, rightWidth)
    ];

    // Take the left and right string arrays, format them to be to
    // left and right with a space in between, and then set the box
    // content.
    telemUploadGraph.setContent(
        '\n' + _.zip(leftStrs, rightStrs)
            .map(arr => ' ' + arr.join('  ') + ' ')
            .join('\n\n')
    );
}

let telemUploadData = [[], [], [], []];

// At the beginning we'll mark the telem upload as being not
// available.
setTelemUploadGraphData(telemUploadData, false);

dataRetriever.on('telem-upload-rate', (data) => {
    // Add the latest rates to the current lists, and trim off the
    // first one if if we already have 40 points.
    for (let i = 0; i < 4; i++)
        telemUploadData[i].push(data.rates[i]);

    if (telemUploadData[0].length === 40)
        telemUploadData.map(list => list.shift());

    setTelemUploadGraphData(telemUploadData, data.available);
    screen.render();
});

let imageCapGraph = grid.set(0, 8, 6, 4, blessed.box, {
    label: 'Image Capture Rate'
});

function setImageCapGraphData(data, available = [true, true]) {
    // The graph box is a 1x2 sparkline display with the plane image
    // rate on top and the ground image rate on the bottom.
    let width = imageCapGraph.width - 5;

    let levels = [1.0, 0.8, 0.6, 0.4, 0.2, 0.001];
    let low = 0.4;
    let critical = 0.2;

    let strs = [
        sparklineHeading(
            'Plane (5s):', 'Hz', data[0], available[0], low, critical, width
        ),
        ' ' + sparkline(data[0], levels, low, critical, width),
        sparklineHeading(
            'Ground (5s):', 'Hz', data[1], available[1], low, critical, width
        ),
        ' ' + sparkline(data[1], levels, low, critical, width)
    ];

    imageCapGraph.setContent(
        '\n' + strs.map(str => ' ' + str + ' ').join('\n\n')
    );
}

let imageCapData = [[], []];
let imageCapAvailable = [false, false];

// At the beginning we'll mark the image capture rate as being not
// available.
setImageCapGraphData(telemUploadData, imageCapAvailable);

dataRetriever.on('image-cap-rate-plane', (data) => {
    // Add the latest rate to the plane list, and trim off the first
    // one if if we already have 40 points.
    imageCapData[0].push(data.rate);

    if (imageCapData[0].length === 40)
        imageCapData.map(list => list.shift());

    imageCapAvailable = [data.available, imageCapAvailable[1]];

    setImageCapGraphData(imageCapData, imageCapAvailable);
    screen.render();
});

dataRetriever.on('image-cap-rate-ground', (data) => {
    // Add the latest rate to the ground list, and trim off the first
    // one if if we already have 40 points.
    imageCapData[1].push(data.rate);

    if (imageCapData[1].length === 40)
        imageCapData.map(list => list.shift());

    imageCapAvailable = [imageCapAvailable[0], data.available];

    setImageCapGraphData(imageCapData, imageCapAvailable);
    screen.render();
});

// Allow escape, q, and Ctrl+C to exit the process. Note this is only
// useful when not running a service in the background.
screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

// Start rendering the screen.
screen.render();
