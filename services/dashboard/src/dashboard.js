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
import request from 'request';

import { PingTimes } from './messages/stats_pb';

import { parseMessage } from './util';

// The main screen object.
let screen = blessed.screen();

// The screen is set up in a 12x12 grid.
let grid = new contrib.grid({ rows: 12, cols: 12, screen: screen });

// The ping table shows the output from the pong service.
let pingTable = grid.set(0, 0, 12, 12, contrib.table, {
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

screen.key(['escape', 'q', 'C-c'], () => process.exit(0));

screen.render();
