/**
 * Request Logger Middleware
 * Logs all HTTP requests
 */

import morgan from 'morgan';
import { Request, Response } from 'express';
import { morganStream } from '../utils/logger';

// Define custom token for response time in color
morgan.token('status-colored', (req: Request, res: Response) => {
  const status = res.statusCode;
  const color = status >= 500 ? '31' // red
    : status >= 400 ? '33' // yellow
    : status >= 300 ? '36' // cyan
    : '32'; // green
  
  return `\x1b[${color}m${status}\x1b[0m`;
});

// Custom format for development
const devFormat = ':method :url :status-colored :response-time ms - :res[content-length]';

// JSON format for production
const prodFormat = JSON.stringify({
  method: ':method',
  url: ':url',
  status: ':status',
  responseTime: ':response-time ms',
  contentLength: ':res[content-length]',
  userAgent: ':user-agent',
  ip: ':remote-addr',
});

// Export the appropriate morgan middleware based on environment
export const requestLogger = morgan(
  process.env.NODE_ENV === 'development' ? devFormat : prodFormat,
  {
    stream: morganStream,
    // Skip logging for health check endpoint
    skip: (req: Request) => req.url === '/health',
  }
);
