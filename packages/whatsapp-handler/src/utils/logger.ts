import winston from 'winston';

const { combine, timestamp, json, errors, colorize, simple } = winston.format;

const isProduction = process.env.NODE_ENV === 'production';

export const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  defaultMeta: {
    service: 'whatsapp-handler',
    environment: process.env.NODE_ENV || 'development',
  },
  transports: [
    new winston.transports.Console({
      format: isProduction
        ? combine(timestamp(), json())
        : combine(colorize(), simple()),
    }),
  ],
});

// Add request context helper
export function createRequestLogger(requestId: string, phoneNumber?: string) {
  return logger.child({
    requestId,
    phoneNumber: phoneNumber ? `${phoneNumber.slice(0, 4)}****` : undefined,
  });
}
