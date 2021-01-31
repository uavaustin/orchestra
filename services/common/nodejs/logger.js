/**
 * Common logger accross Node.js services.
 *
 * By default, the logging level is set to info for the console,
 * however, this can be set at runtime using the LOG_LEVEL
 * environment variable.
 *
 * Should be copied into the service via the Makefile.
 */

import winston from 'winston';

let consoleLevel = process.env.LOG_LEVEL || 'info';

// If we're in a test suite, increase the default logging level.
if (process.env.NODE_ENV === 'test') {
  consoleLevel = 'warning';
}

let logger = winston.createLogger({
  levels: winston.config.syslog.levels,
  transports: [
    new winston.transports.Console({
      level: consoleLevel,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export default logger;
