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

import { PingTimes, InteropUploadRate } from './messages/stats_pb';

import { parseMessage } from './util';

// The main screen object.
let screen = blessed.screen();

// The screen is set up in a 12x12 grid.
let grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

// The ping table shows the output from the pong service.
let pingTable = grid.set(6, 0, 6, 12, contrib.table, {
    label: 'Ping',
    keys: true,
    interactive: false,
    columnWidth: [15, 16, 5, 9]
});

function setPingTableData(data) {
    pingTable.setData({
        headers: ['Name', 'Host', 'Port', 'Ping (ms)'],
        data: data
    });
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
        let message = parseMessage(err, resp, PingTimes);
        let data = [];

        // If we have a message (i.e. no error), then take each
        // listing and put it in a 4 element array corresponding to
        // the ping time headers. If the service is offline, we'll
        // print the line in read. This is sorted first by increasing
        // hostname, and then by increasing port number.
        if (message !== null) {
            data = message.getListList().sort((a, b) =>
                a.getHost() !== b.getHost() ? a.getHost() > b.getHost() :
                                              a.getPort() > b.getPort()
            ).map((time) => {
                if (time.getOnline()) {
                    return [
                        time.getName(),
                        time.getHost(),
                        time.getPort(),
                        time.getMs()
                    ];
                } else {
                    return [
                        chalk.red(time.getName()),
                        chalk.red(time.getHost()),
                        chalk.red(time.getPort()),
                        chalk.red('-')
                    ];
                }
            });
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
            return desc + chalk.bold.red(sprintf(`%${width - 10}s`, 'n/a'));
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
        let message = parseMessage(err, resp, InteropUploadRate);
        let data = [];

        // If we have a message (i.e. no error) then add the latest
        // rates to the current lists, (and trim off the first one if
        // if we already have 40 points).
        let available = message !== null;

        if (available) {
            telemUploadData[0].push(message.getTotal1());
            telemUploadData[1].push(message.getTotal5());
            telemUploadData[2].push(message.getFresh1());
            telemUploadData[3].push(message.getFresh5());

            if (telemUploadData[0].length === 40)
                telemUploadData.map(list => list.shift());
        }

        setTelemUploadGraphData(telemUploadData, available);
        screen.render();

        setTimeout(next, 1000);
    });
});

screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

screen.render();
