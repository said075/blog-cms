/**
 * Consistent API Response Utilities
 */

import { Response } from 'express';

interface SuccessResponse<T = any> {
  success: true;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

interface ErrorResponse {
  success: false;
  error: string;
  details?: any;
}

/**
 * Send success response
 */
export const sendSuccess = <T = any>(
  res: Response,
  data?: T,
  message?: string,
  statusCode = 200
): Response => {
  const response: SuccessResponse<T> = {
    success: true,
  };

  if (message) response.message = message;
  if (data !== undefined) response.data = data;

  return res.status(statusCode).json(response);
};

/**
 * Send paginated success response
 */
export const sendPaginated = <T = any>(
  res: Response,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  }
): Response => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return res.status(200).json({
    success: true,
    data,
    pagination: {
      ...pagination,
      totalPages,
      hasMore: pagination.page < totalPages,
      hasPrevious: pagination.page > 1,
    },
  });
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  details?: any
): Response => {
  const response: ErrorResponse = {
    success: false,
    error,
  };

  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 */
export const sendCreated = <T = any>(
  res: Response,
  data: T,
  message = 'Resource created successfully'
): Response => {
  return sendSuccess(res, data, message, 201);
};

/**
 * Send no content response (204)
 */
export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};
