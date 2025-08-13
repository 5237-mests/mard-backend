import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

// Extend Request interface to include user info
declare global {
  namespace Express {
    interface Request {
      user?: any;
      startTime?: number;
    }
  }
}

export interface LogData {
  method: string;
  url: string;
  ip: string;
  userAgent: string;
  userId?: string;
  userRole?: string;
  requestBody?: any;
  responseBody?: any;
  statusCode: number;
  responseTime: number;
  timestamp: string;
}

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  // Record start time
  req.startTime = Date.now();

  // Capture request body (excluding sensitive data)
  const requestBody = { ...req.body };
  if (requestBody.password) {
    requestBody.password = '[REDACTED]';
  }
  if (requestBody.token) {
    requestBody.token = '[REDACTED]';
  }

  // Log request
  logger.info('API Request', {
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown',
    userId: req.user?.id,
    userRole: req.user?.role,
    requestBody: Object.keys(requestBody).length > 0 ? requestBody : undefined,
    timestamp: new Date().toISOString(),
  });

  // Capture original send method
  const originalSend = res.send;

  // Override send method to capture response
  res.send = function (body: any) {
    const responseTime = Date.now() - (req.startTime || 0);
    
    // Log response
    logger.info('API Response', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userId: req.user?.id,
      userRole: req.user?.role,
      responseBody: body ? (typeof body === 'string' ? body.substring(0, 1000) : body) : undefined,
      timestamp: new Date().toISOString(),
    });

    // Call original send method
    return originalSend.call(this, body);
  };

  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const responseTime = Date.now() - (req.startTime || 0);
  
  logger.error('API Error', {
    method: req.method,
    url: req.url,
    error: err.message,
    stack: err.stack,
    statusCode: res.statusCode || 500,
    responseTime: `${responseTime}ms`,
    userId: req.user?.id,
    userRole: req.user?.role,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown',
    timestamp: new Date().toISOString(),
  });

  next(err);
};

// Performance monitoring middleware
export const performanceLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (duration > 1000) { // Log slow requests (>1s)
      logger.warn('Slow API Request', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        statusCode: res.statusCode,
        userId: req.user?.id,
        userRole: req.user?.role,
        timestamp: new Date().toISOString(),
      });
    }
  });

  next();
};
