import chalk from 'chalk';
import { sprintf } from 'sprintf-js';

// Makes a sparkline in the same manner as shiwano/sparkline on
// github. Also colors them with the same rules for displaying the
// rate.
export function sparkline(data, levels, low, critical, width) {
    let str = '';

    for (let i = data.length - width; i < data.length; i++) {
        // If there's not enough points, just add spaces.
        if (i < 0) {
            str += ' ';
            continue;
        }

        let rate = data[i];

        let char;
        let color;

        if (rate >= levels[0]) {
            char = '\u2587';
        } else if (rate >= levels[1]) {
            char = '\u2586';
        } else if (rate >= levels[2]) {
            char = '\u2585';
        } else if (rate >= levels[3]) {
            char = '\u2584';
        } else if (rate >= levels[4]) {
            char = '\u2583';
        } else if (rate >= levels[5]) {
            char = '\u2582';
        } else {
            char = '\u2581';
        }

        if (rate >= low) {
            color = chalk.cyan;
        } else if (rate >= critical) {
            color = chalk.yellow;
        } else {
            color = chalk.bold.red;
        }

        str += color(char);
    }

    return str;
}

// Makes the heading that goes above a sparkline.
export function sparklineHeading(desc, unit, data, available, low, critical,
        width) {
    let left = chalk.bold.green(desc);
    let right;

    // The right is simply the last element in the list or n/a if we
    // don't have any current rate.
    if (available) {
        let rate = data[data.length - 1] || 0.0;
        let rightLen = width - desc.length - unit.length - 1;
        let rightStr = sprintf(` %${rightLen}.1f ${unit}`, rate);

        if (rate >= low) {
            right = chalk.green(rightStr);
        } else if (rate >= critical) {
            right = chalk.yellow(rightStr);
        } else {
            right = chalk.bold.red(rightStr);
        }
    } else {
        let rightLen = width - desc.length;
        right = chalk.bold.red(sprintf(` %${rightLen}s`, '(n/a)'));
    }

    return left + right;
}
