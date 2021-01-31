/**
 * Terminal dashboard which shows the system status.
 *
 * This uses the blessed (and blessed-contrib) libraries to make a
 * somewhat-graphical terminal dashboard display.
 */

import async from 'async';
import blessed from 'blessed';
import contrib from 'blessed-contrib';
import chalk from 'chalk';
import _ from 'lodash';
import request from 'request';
import { sprintf } from 'sprintf-js';

import { stats } from './messages';

import { parseMessage } from './util';

// The main screen object.
let screen = blessed.screen();

// The screen is set up in a 12x12 grid.
let grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

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

// Keep making requests to the pong service to get the current ping
// times.
async.forever((next) => {
    request.get({
        uri: 'http://' + process.env.PONG_URL + '/api/ping',
        encoding: null,
        timeout: 2000,
    }, (err, resp) => {
        // Parse the message as the PingTimes protobuf.
        let message = parseMessage(err, resp, stats.PingTimes);
        let data = [];

        // If we have a message (i.e. no error), then take each
        // listing and put it in a 5 element array corresponding to
        // the ping time headers, with the first being if the service
        // is online or not. This is sorted first by increasing
        // hostname, and then by increasing port number.
        if (message !== null) {
            data = message.list.sort((a, b) =>
                a.host !== b.host ? a.host > b.host : a.port > b.port
            ).map(time => [
                time.online, time.name, time.host, time.port, time.ms
            ]);
        }

        setPingTableData(data);
        screen.render();

        setTimeout(next, 1000);
    });
});

// The telemetry upload data graphs the stats from forward interop.
// This is the rate at which telemetry is uploaded (over 1 and 5
// seconds), and the rate at which new telemetry is being uploaded as
// well, which excludes any stale or duplicated data that we're
// sending.
let telemUploadGraph = grid.set(0, 0, 6, 12, blessed.box, {
    label: 'Telemetry Uplink'
});

function setTelemUploadGraphData(data, available = true) {
    // Makes the bar that goes above the sparkline.
    function stylizeRate(desc, rateList, width) {
        desc = chalk.bold.green(desc);

        // The rate is simply the last element in the list or n/a if
        // we don't have any current rate.
        if (available) {
            let rate = rateList[rateList.length - 1] || 0.0;
            let rateStr = sprintf(`%${width - 13}.1f Hz`, rate);

            // We'll say that a rate of 3.0 seconds is good, but 1.0
            // is the bare minimum.
            if (rate >= 3.0) {
                return desc + chalk.green(rateStr);
            } else if (rate >= 1.0) {
                return desc + chalk.yellow(rateStr);
            } else {
                return desc + chalk.bold.red(rateStr);
            }
        } else {
            return desc + chalk.bold.red(sprintf(`%${width - 10}s`, '(n/a)'));
        }
    }

    // Makes a sparkline in the same manner as shiwano/sparkline on
    // github. Also colors them with the same rules for displaying
    // the rate.
    function makeSparkline(rateList, width) {
        let str = ' ';

        for (let i = rateList.length - width; i < rateList.length; i++) {
            // If there's not enough points, just add spaces.
            if (i < 0) {
                str += ' ';
                continue;
            }

            let rate = rateList[i];

            // FIXME: This is a ton of escape codes that could
            //        ideally be grouped together by color.

            if (rate >= 5.0) {
                str += chalk.cyan('\u2587');
            } else if (rate >= 4.0) {
                str += chalk.cyan('\u2586');
            } else if (rate >= 3.0) {
                str += chalk.cyan('\u2585');
            } else if (rate >= 2.0) {
                str += chalk.yellow('\u2584');
            } else if (rate >= 1.0) {
                str += chalk.yellow('\u2583');
            } else if (rate > 0.0) {
                str += chalk.bold.red('\u2582');
            } else {
                str += chalk.bold.red('\u2581');
            }
        }

        return str;
    }

    // The graph box is a 2x2 sparkline display with total telemetry
    // on the left and the fresh on the right.
    let leftWidth = Math.floor((telemUploadGraph.width - 8) / 2);
    let rightWidth = telemUploadGraph.width - 8 - leftWidth;

    let leftStrs = [
        stylizeRate('Total (1s):', data[0], leftWidth),
        makeSparkline(data[0], leftWidth),
        stylizeRate('Total (5s):', data[1], leftWidth),
        makeSparkline(data[1], leftWidth)
    ];

    let rightStrs = [
        stylizeRate('Fresh (1s):', data[2], rightWidth),
        makeSparkline(data[2], rightWidth ),
        stylizeRate('Fresh (5s):', data[3], rightWidth),
        makeSparkline(data[3], rightWidth),
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
let telemUploadAvailable = false;

// At the beginning we'll mark the telem upload as being not
// available.
setTelemUploadGraphData(telemUploadData, telemUploadAvailable);

// Keep making requests to the pong service to get the current ping
// times.
async.forever((next) => {
    request.get({
        uri: 'http://' + process.env.FORWARD_INTEROP_URL + '/api/upload-rate',
        encoding: null,
        timeout: 2000,
    }, (err, resp) => {
        // Parse the message as the InteropUploadRate protobuf.
        let message = parseMessage(err, resp, stats.InteropUploadRate);
        let data = [];

        // If we have a message (i.e. no error) then add the latest
        // rates to the current lists, (and trim off the first one if
        // if we already have 40 points).
        let available = message !== null;

        if (available) {
            telemUploadData[0].push(message.total_1);
            telemUploadData[1].push(message.total_5);
            telemUploadData[2].push(message.fresh_1);
            telemUploadData[3].push(message.fresh_5);
        } else {
            telemUploadData[0].push(0.0);
            telemUploadData[1].push(0.0);
            telemUploadData[2].push(0.0);
            telemUploadData[3].push(0.0);
        }

        if (telemUploadData[0].length === 40)
            telemUploadData.map(list => list.shift());

        setTelemUploadGraphData(telemUploadData, available);
        screen.render();

        setTimeout(next, 1000);
    });
});

// Allow escape, q, and Ctrl+C to exit the process. Note this is only
// useful when not running a service in the background.
screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

// Start rendering the screen.
screen.render();
