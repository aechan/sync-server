import winston from 'winston';
/**
 * Global logger
 */
export const logger: winston.LoggerInstance = new winston.Logger({
    levels: winston.config.npm.levels,
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log`
      // - Write all logs error (and below) to `error.log`.
      //
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });
