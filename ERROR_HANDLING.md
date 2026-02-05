# 🛡️ Error Handling & Logging Guide

This document explains the professional error handling and logging system implemented in the Blog CMS API.

---

## ✨ Features

### 1. **Global Error Handler**
Catches all errors and returns consistent, clean responses.

### 2. **Custom Error Classes**
Structured error types for predictable error handling.

### 3. **Request Logging**
Automatic HTTP request/response logging.

### 4. **Application Logging**
Centralized logging with Winston to files and console.

### 5. **Consistent API Responses**
Standardized success and error response formats.

---

## 🎯 Custom Error Classes

Located in `src/utils/errors.ts`:

```typescript
// Base error class
class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

// Specific error types
BadRequestError        // 400 - Invalid input
UnauthorizedError      // 401 - Authentication required
ForbiddenError         // 403 - Insufficient permissions
NotFoundError          // 404 - Resource not found
ConflictError          // 409 - Resource conflict (e.g., duplicate)
ValidationError        // 422 - Validation failed
InternalServerError    // 500 - Server error
```

### Usage Example

```typescript
import { NotFoundError, BadRequestError } from '../utils/errors';

// In your service
async function getPostById(id: string) {
  if (!id) {
    throw new BadRequestError('Post ID is required');
  }
  
  const post = await prisma.post.findUnique({ where: { id } });
  
  if (!post) {
    throw new NotFoundError('Post not found');
  }
  
  return post;
}
```

---

## 🔧 Global Error Handler

Located in `src/middlewares/error.middleware.ts`:

### Features:
- **Catches all errors** automatically
- **Logs errors** with context (path, method, IP)
- **Handles Prisma errors** (database errors)
- **Handles JWT errors** (token errors)
- **Consistent response format**
- **Different output for dev/prod**

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

### Development Mode
In development, errors include stack traces:
```json
{
  "success": false,
  "error": "Post not found",
  "stack": "Error: Post not found\n    at..."
}
```

---

## 📝 Logging System

### Winston Logger

Located in `src/utils/logger.ts`:

**Log Levels:**
- `error` - Error messages
- `warn` - Warning messages
- `info` - Informational messages
- `http` - HTTP requests
- `debug` - Debug information

**Log Outputs:**
- **Console**: Colorized, formatted logs
- **File**: `logs/combined.log` - All logs
- **File**: `logs/error.log` - Error logs only

### Usage Example

```typescript
import logger from '../utils/logger';

// Info log
logger.info('User created successfully', { userId: user.id });

// Error log
logger.error('Database connection failed', {
  error: err.message,
  stack: err.stack
});

// Warning log
logger.warn('API rate limit approaching', {
  userId: user.id,
  requestCount: 95
});

// Debug log
logger.debug('Processing request', {
  method: 'POST',
  path: '/api/posts'
});
```

---

## 🌐 Request Logging

Located in `src/middlewares/request-logger.middleware.ts`:

Uses Morgan to log all HTTP requests automatically.

### Log Format (Development):
```
GET /api/posts 200 15.234 ms - 1234
POST /api/auth/login 401 89.123 ms - 45
```

### Features:
- **Color-coded status codes**
  - 🟢 Green: 2xx (success)
  - 🔵 Cyan: 3xx (redirect)
  - 🟡 Yellow: 4xx (client error)
  - 🔴 Red: 5xx (server error)
- **Response time tracking**
- **Content length**
- **Skip health check endpoint**

### Logs Output

All request logs go to:
- Console (in development)
- `logs/combined.log` (always)

---

## 📊 Consistent API Responses

Located in `src/utils/response.ts`:

### Success Response

```typescript
import { sendSuccess } from '../utils/response';

// Simple success
sendSuccess(res, data);

// With message
sendSuccess(res, data, 'Post created successfully', 201);
```

**Output:**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": { ... }
}
```

### Paginated Response

```typescript
import { sendPaginated } from '../utils/response';

sendPaginated(res, posts, {
  page: 1,
  limit: 10,
  total: 45
});
```

**Output:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "hasMore": true,
    "hasPrevious": false
  }
}
```

### Error Response

```typescript
import { sendError } from '../utils/response';

sendError(res, 'Post not found', 404);
```

**Output:**
```json
{
  "success": false,
  "error": "Post not found"
}
```

---

## 🔍 Handled Error Types

### 1. **Prisma Errors** (Database)

| Code | Status | Message |
|------|--------|---------|
| P2002 | 409 | Record already exists (unique constraint) |
| P2003 | 400 | Referenced record does not exist |
| P2025 | 404 | Record not found |
| P2014 | 400 | Invalid ID provided |

### 2. **JWT Errors** (Authentication)

| Error | Status | Message |
|-------|--------|---------|
| JsonWebTokenError | 401 | Invalid token |
| TokenExpiredError | 401 | Token expired |

### 3. **Validation Errors**

| Error | Status | Message |
|-------|--------|---------|
| ValidationError | 422 | Validation failed |

---

## 🚀 Usage in Routes

### Without Async Handler

```typescript
router.get('/posts/:id', async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.id);
    sendSuccess(res, post);
  } catch (error) {
    next(error); // Pass to global error handler
  }
});
```

### With Async Handler

```typescript
import { asyncHandler } from '../middlewares/error.middleware';

router.get('/posts/:id', asyncHandler(async (req, res) => {
  const post = await postService.getPostById(req.params.id);
  sendSuccess(res, post);
}));
// No try-catch needed! Errors automatically caught
```

---

## 📁 File Structure

```
src/
├── utils/
│   ├── errors.ts           # Custom error classes
│   ├── logger.ts           # Winston logger configuration
│   └── response.ts         # Response utilities
├── middlewares/
│   ├── error.middleware.ts       # Global error handler
│   └── request-logger.middleware.ts  # Request logging
logs/
├── combined.log            # All logs
└── error.log               # Error logs only
```

---

## 🧪 Testing Error Handling

### Test 404 Error
```bash
curl http://localhost:3001/api/nonexistent
```

**Response:**
```json
{
  "success": false,
  "error": "Route not found",
  "path": "/api/nonexistent"
}
```

### Test Validation Error
```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"title": ""}'
```

**Response:**
```json
{
  "success": false,
  "error": "Title and content are required"
}
```

### Test Authentication Error
```bash
curl http://localhost:3001/api/auth/me
```

**Response:**
```json
{
  "success": false,
  "error": "No token provided. Please login first."
}
```

---

## 📊 Log Files

### View Combined Logs
```bash
tail -f logs/combined.log
```

### View Error Logs Only
```bash
tail -f logs/error.log
```

### Search Logs
```bash
# Find all 500 errors
grep '"level":"error"' logs/combined.log

# Find specific user's requests
grep "userId.*user-123" logs/combined.log
```

---

## 🎯 Best Practices

### 1. **Always Use Custom Errors**
```typescript
// ❌ Bad
throw new Error('Post not found');

// ✅ Good
throw new NotFoundError('Post not found');
```

### 2. **Log Important Events**
```typescript
// ✅ Good
logger.info('User created', { userId: user.id, email: user.email });
logger.error('Payment failed', { orderId, error: err.message });
```

### 3. **Don't Log Sensitive Data**
```typescript
// ❌ Bad - Never log passwords or tokens
logger.info('User login', { password: user.password });

// ✅ Good
logger.info('User login', { userId: user.id });
```

### 4. **Use Appropriate Log Levels**
- `error`: Something failed
- `warn`: Something suspicious
- `info`: Normal operation
- `debug`: Detailed information

### 5. **Include Context in Errors**
```typescript
// ✅ Good
logger.error('Database query failed', {
  query: 'findUser',
  userId: id,
  error: err.message
});
```

---

## 🔒 Production Configuration

### Environment Variables

```env
# .env
NODE_ENV=production
LOG_LEVEL=info  # Don't log debug in production
```

### Log Rotation

Consider implementing log rotation for production:
- Keep logs for 30 days
- Rotate logs daily
- Compress old logs
- Use a service like AWS CloudWatch or Loggly

---

## 📈 Monitoring

### What to Monitor

1. **Error Rate**: Track 4xx and 5xx responses
2. **Response Times**: Log slow requests
3. **Failed Logins**: Security monitoring
4. **Database Errors**: Connection issues
5. **API Usage**: Rate limiting triggers

### Example: Track Slow Requests

```typescript
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`
      });
    }
  });
  
  next();
});
```

---

## ✅ Benefits

1. **Predictable Error Responses**: Always same format
2. **Easy Debugging**: Logs with context
3. **Better UX**: Clean error messages
4. **Production-Ready**: File logging, error tracking
5. **Maintainable**: Centralized error handling

---

**Status**: ✅ Production-Ready Error Handling  
**Last Updated**: February 5, 2026
