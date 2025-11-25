import winston from 'winston';

const { combine, timestamp, json, errors, colorize, simple } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(errors({ stack: true }), timestamp(), json()),
  defaultMeta: {
    service: 'petvet-api',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.Console({
      format: isProduction ? combine(timestamp(), json()) : combine(colorize(), simple()),
    }),
  ],
});
