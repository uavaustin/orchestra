import chalk from 'chalk';

import logger from './logger';

/** Log the request and how long it took. */
export default function koaLogger() {
  return async function (ctx, next) {
    let start = Date.now();

    await next();

    let time = Date.now() - start;
    let timeStamp = new Date(Date.now());
    timeStamp = timeStamp.toString().
      substring(0, timeStamp.toString().indexOf('GMT')) + 'CST';

    let statusColor;

    if (ctx.status < 400) {
      statusColor = chalk.green;
    } else if (ctx.status < 500) {
      statusColor = chalk.yellow;
    } else {
      statusColor = chalk.bold.red;
    }

    let status = statusColor(ctx.status.toString());

    logger.info(`${ctx.method} ${ctx.originalUrl} - ${status}
                 in ${time} ms on ${timeStamp}`);
  };
}
