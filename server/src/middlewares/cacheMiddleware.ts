import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger';

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};

// Cache expiration time in milliseconds (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;

/**
 * Middleware to cache API responses based on request body
 */
export const cacheMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Only cache specific routes and methods
  if (req.method !== 'POST') {
    return next();
  }
  
  try {
    // Create a hash of the request body for cache key
    const cacheKey = crypto
      .createHash('md5')
      .update(JSON.stringify({ 
        body: req.body,
        path: req.path
      }))
      .digest('hex');
    
    // Check if we have a valid cache entry
    if (cache[cacheKey] && 
        Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
      
      logger.info(`Cache hit for ${req.path}`);
      
      // Return cached data
      return res.status(200).json({
        ...cache[cacheKey].data,
        fromCache: true
      });
    }
    
    // Cache miss, continue to the controller but intercept the response
    const originalSend = res.send;
    res.send = function(body) {
      // Only cache successful responses
      if (res.statusCode === 200) {
        try {
          const data = JSON.parse(body);
          cache[cacheKey] = {
            data,
            timestamp: Date.now()
          };
          logger.info(`Cached response for ${req.path}`);
        } catch (err) {
          logger.error('Error caching response:', err);
        }
      }
      
      return originalSend.call(this, body);
    };
    
    next();
    
  } catch (error) {
    logger.error('Error in cache middleware:', error);
    next();
  }
};

/**
 * Utility function to clear cache
 */
export const clearCache = () => {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
  
  logger.info('Cache cleared');
}; 