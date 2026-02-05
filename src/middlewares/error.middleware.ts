/**
 * Global Error Handler Middleware
 * Catches all errors and returns consistent, clean responses
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { Prisma } from '@prisma/client';

/**
 * Global error handler
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error
  logger.error('Error occurred', {
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle known operational errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const { statusCode, message } = handlePrismaError(err);
    return res.status(statusCode).json({
      success: false,
      error: message,
    });
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      error: 'Invalid data provided',
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expired',
    });
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      success: false,
      error: err.message,
    });
  }

  // Default to 500 server error
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): {
  statusCode: number;
  message: string;
} {
  switch (error.code) {
    case 'P2002':
      // Unique constraint violation
      const target = error.meta?.target;
      const field = Array.isArray(target) ? target[0] : 'field';
      return {
        statusCode: 409,
        message: `A record with this ${field} already exists`,
      };

    case 'P2003':
      // Foreign key constraint violation
      return {
        statusCode: 400,
        message: 'Referenced record does not exist',
      };

    case 'P2025':
      // Record not found
      return {
        statusCode: 404,
        message: 'Record not found',
      };

    case 'P2014':
      // Invalid ID
      return {
        statusCode: 400,
        message: 'Invalid ID provided',
      };

    default:
      return {
        statusCode: 500,
        message: 'Database error occurred',
      };
  }
}

/**
 * Not found handler (404)
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
};

/**
 * Async handler wrapper
 * Catches errors from async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
