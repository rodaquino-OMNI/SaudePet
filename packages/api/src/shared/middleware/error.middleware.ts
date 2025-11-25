import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error('Request error', {
    error: err.message,
    stack: err.stack,
    name: err.name,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        code: err.code,
      },
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: {
        message: 'Validation failed',
        details: err.message,
      },
    });
  }

  // Handle TypeORM errors
  if (err.name === 'QueryFailedError') {
    return res.status(500).json({
      error: {
        message: 'Database error',
        code: 'DB_ERROR',
      },
    });
  }

  // Default error
  return res.status(500).json({
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_ERROR',
    },
  });
}
