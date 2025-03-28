import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types';
import logger from '../utils/logger';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error implements AppError {
  statusCode: number;
  code: string;
  details?: unknown;

  constructor(statusCode: number, message: string, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message: string, code = 'BAD_REQUEST', details?: unknown): ApiError {
    return new ApiError(400, message, code, details);
  }

  static unauthorized(message = 'Unauthorized', code = 'UNAUTHORIZED', details?: unknown): ApiError {
    return new ApiError(401, message, code, details);
  }

  static forbidden(message = 'Forbidden', code = 'FORBIDDEN', details?: unknown): ApiError {
    return new ApiError(403, message, code, details);
  }

  static notFound(message = 'Resource not found', code = 'NOT_FOUND', details?: unknown): ApiError {
    return new ApiError(404, message, code, details);
  }

  static tooManyRequests(message = 'Too many requests', code = 'RATE_LIMIT', details?: unknown): ApiError {
    return new ApiError(429, message, code, details);
  }

  static internal(message = 'Internal server error', code = 'INTERNAL_ERROR', details?: unknown): ApiError {
    return new ApiError(500, message, code, details);
  }
}

/**
 * Custom error handler middleware
 */
export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = (err as ApiError).code || 'INTERNAL_ERROR';
  const details = (err as ApiError).details;
  
  // Log the error with request context
  logger.error({
    message: `${statusCode} - ${err.message}`,
    code,
    path: req.originalUrl,
    method: req.method,
    ip: req.ip,
    error: err,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
  
  // Send error response
  res.status(statusCode).json({
    status: 'error',
    code,
    message: statusCode === 500 && process.env.NODE_ENV !== 'development' 
      ? 'Internal server error' 
      : err.message,
    details: process.env.NODE_ENV === 'development' ? details : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

/**
 * 404 Not Found middleware
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(ApiError.notFound(`Resource not found - ${req.originalUrl}`));
}; 