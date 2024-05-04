// Importing Winston library
import * as winston from 'winston';

// Defining console transport configuration
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    // Adding colorization to log output
    winston.format.colorize(),
    // Adding timestamp to each log entry
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    // Customizing log message format
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    }),
  ),
});

// Defining file transport creator function
const createFileTransport = (filename: string, level: string) => {
  return new winston.transports.File({
    filename,
    level,
    format: winston.format.combine(
      // Adding timestamp to each log entry
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      // Customizing log message format
      winston.format.printf(({ timestamp, level, message }) => {
        return `[${level.toUpperCase()}] - ${timestamp} : ${message}`;
      }),
    ),
  });
};

// Defining createLogger function
const createLogger = (
  transports: (
    | winston.transports.ConsoleTransportInstance
    | winston.transports.FileTransportInstance
  )[] = [],
) => {
  return winston.createLogger({ transports });
};

// Creating file transport instances for different severity levels
const infoFileTransport = createFileTransport('./storage/log/info.log', 'info');
const errorFileTransport = createFileTransport(
  '.storage.log.error.log',
  'error',
);
const debugFileTransport = createFileTransport(
  '.storage.log.debug.log',
  'debug',
);

// Creating logger instances with console and file transport configurations
const infoLogger = createLogger([consoleTransport, infoFileTransport]);
const errorLogger = createLogger([consoleTransport, errorFileTransport]);
const debugLogger = createLogger([debugFileTransport]);

// Exports a logger object to be used for logging different severity levels of messages
export const logger = {
  info: function (message: string) {
    infoLogger.info(message);
  },
  error: function (message: string) {
    errorLogger.error(message);
  },
  debug: function (message: string) {
    debugLogger.debug(message);
  },
};
