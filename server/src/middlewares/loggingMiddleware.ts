import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ExtendedRequest } from '../types';
import logger from '../utils/logger';

/**
 * Request logging middleware
 * Logs incoming requests and adds a unique ID to each request
 */
export const requestLogger = (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction
) => {
  // Generate a unique ID for the request
  req.id = uuidv4();
  
  // Log the request
  logger.info(`[${req.id}] ${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // Log request body in debug mode (but hide sensitive data)
  if (process.env.NODE_ENV === 'development' && req.body) {
    const sanitizedBody = { ...req.body };
    
    // Remove sensitive fields if present
    if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
    if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
    if (sanitizedBody.secret) sanitizedBody.secret = '[REDACTED]';
    if (sanitizedBody.apiKey) sanitizedBody.apiKey = '[REDACTED]';
    
    logger.debug(`[${req.id}] Request Body: ${JSON.stringify(sanitizedBody)}`);
  }
  
  // Log response data
  const originalSend = res.send;
  res.send = function(body) {
    logger.info(`[${req.id}] Response: ${res.statusCode}`);
    
    // Log response body in debug mode
    if (process.env.NODE_ENV === 'development') {
      try {
        // Only log if the response is JSON
        if (res.getHeader('content-type')?.toString().includes('application/json')) {
          const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
          logger.debug(`[${req.id}] Response Body: ${JSON.stringify(parsedBody).substring(0, 500)}${JSON.stringify(parsedBody).length > 500 ? '...' : ''}`);
        }
      } catch (err) {
        // If we can't parse the body, just log its length
        logger.debug(`[${req.id}] Response Body: [unparsed content of length ${body?.length || 0}]`);
      }
    }
    
    return originalSend.call(this, body);
  };
  
  next();
}; 