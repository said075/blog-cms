# 📚 Blog CMS API - Complete Documentation

Comprehensive API documentation for the Blog CMS RESTful API.

---

## 📋 Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
   - [Health & Info](#health--info)
   - [Authentication](#authentication-endpoints)
   - [Posts](#posts-endpoints)
   - [Comments](#comments-endpoints)
4. [Error Responses](#error-responses)
5. [Status Codes](#status-codes)
6. [Rate Limiting](#rate-limiting)
7. [Best Practices](#best-practices)

---

## 🚀 Getting Started

### Base URLs
- **Development**: `http://localhost:3001`
- **Docker**: `http://localhost:3000`
- **Production**: `https://your-domain.com`

### Authentication
Most endpoints require a JWT token. Include it in the `Authorization` header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Content Type
All requests should use `Content-Type: application/json`.

### Response Format
All responses follow this structure:

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // optional
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message",
  "path": "/api/route", // for 404s
  "stack": "..." // only in development
}
```

---

## 🔐 Authentication

### How It Works
1. **Signup** or **Login** to get a JWT token
2. Include token in `Authorization` header for protected routes
3. Token expires after 7 days (configurable)

### User Roles
- **READER**: Default role, can view content and comment
- **AUTHOR**: Can create and manage own posts
- **ADMIN**: Full access to all features

---

## 📡 Endpoints

### Health & Info

#### GET `/health`
Check API health status.

**Authentication**: Not required

**Response:**
```json
{
  "success": true,
  "message": "API is healthy",
  "data": {
    "status": "ok",
    "timestamp": "2026-02-05T10:30:00.000Z"
  }
}
```

---

#### GET `/`
Get API information and available endpoints.

**Authentication**: Not required

**Response:**
```json
{
  "success": true,
  "message": "Welcome to Blog CMS API",
  "data": {
    "status": "running",
    "version": "1.0.0",
    "endpoints": {
      "auth": "/api/auth",
      "posts": "/api/posts",
      "comments": "/api/comments"
    }
  }
}
```

---

## 🔐 Authentication Endpoints

### POST `/api/auth/signup`
Create a new user account.

**Authentication**: Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Validation:**
- `email`: Valid email, unique
- `username`: Alphanumeric, 3-30 chars, unique
- `password`: Min 8 chars, must include uppercase, lowercase, number
- `firstName`, `lastName`: 2-50 chars

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "READER",
      "firstName": "John",
      "lastName": "Doe",
      "status": "ACTIVE",
      "createdAt": "2026-02-05T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400`: Password doesn't meet requirements
- `409`: Email or username already exists

---

### POST `/api/auth/login`
Login with credentials.

**Authentication**: Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `401`: Invalid credentials or account not active

---

### GET `/api/auth/me`
Get current user profile.

**Authentication**: Required

**Response (200):**
```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "READER",
    "firstName": "John",
    "lastName": "Doe",
    "bio": null,
    "avatar": null,
    "status": "ACTIVE",
    "createdAt": "2026-02-05T10:30:00.000Z",
    "lastLogin": "2026-02-05T11:00:00.000Z"
  }
}
```

---

## 📝 Posts Endpoints

### GET `/api/posts`
Get all posts with filtering, search, pagination, and sorting.

**Authentication**: Not required (but affects visibility)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 10 | Items per page |
| `search` | string | - | Search in title/content/excerpt |
| `authorId` | uuid | - | Filter by author |
| `categoryId` | uuid | - | Filter by category |
| `status` | enum | PUBLISHED | DRAFT, PUBLISHED, ARCHIVED |
| `tags` | string | - | Comma-separated tags |
| `sortBy` | string | createdAt | createdAt, title, viewCount, publishedAt |
| `sortOrder` | enum | desc | asc, desc |

**Example:**
```
GET /api/posts?page=1&limit=10&search=typescript&sortBy=viewCount&sortOrder=desc&tags=nodejs,backend
```

**Response (200):**
```json
{
  "success": true,
  "message": "Posts fetched successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Getting Started with TypeScript",
      "slug": "getting-started-with-typescript",
      "excerpt": "A brief intro to TypeScript...",
      "featuredImage": "https://...",
      "status": "PUBLISHED",
      "viewCount": 150,
      "tags": ["typescript", "nodejs"],
      "publishedAt": "2026-02-01T10:00:00.000Z",
      "createdAt": "2026-02-01T09:00:00.000Z",
      "updatedAt": "2026-02-01T10:00:00.000Z",
      "author": {
        "id": "uuid",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "category": {
        "id": "uuid",
        "name": "Programming",
        "slug": "programming"
      },
      "commentCount": 5
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

---

### POST `/api/posts`
Create a new post.

**Authentication**: Required (AUTHOR or ADMIN)

**Request Body:**
```json
{
  "title": "My Blog Post Title",
  "content": "Full post content here...",
  "excerpt": "Brief summary (optional)",
  "featuredImage": "https://example.com/image.jpg",
  "categoryId": "category-uuid",
  "tags": ["nodejs", "typescript"],
  "status": "PUBLISHED"
}
```

**Field Details:**
- `title` (required): 3-200 chars, auto-generates slug
- `content` (required): Full post text
- `excerpt` (optional): Brief summary
- `featuredImage` (optional): URL to image
- `categoryId` (optional): Category UUID
- `tags` (optional): Array of strings
- `status` (optional): DRAFT (default), PUBLISHED, ARCHIVED

**Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "uuid",
    "title": "My Blog Post Title",
    "slug": "my-blog-post-title",
    "content": "...",
    "status": "PUBLISHED",
    "author": { ... },
    "category": { ... },
    "createdAt": "2026-02-05T10:30:00.000Z"
  }
}
```

**Errors:**
- `401`: Not authenticated
- `403`: Insufficient permissions (not AUTHOR/ADMIN)

---

### GET `/api/posts/:id`
Get a single post by ID.

**Authentication**: Not required

**URL Parameters:**
- `id`: Post UUID

**Response (200):**
```json
{
  "success": true,
  "message": "Post fetched successfully",
  "data": {
    "id": "uuid",
    "title": "...",
    "slug": "...",
    "content": "...",
    "author": { ... },
    "category": { ... },
    "comments": [ ... ]
  }
}
```

**Note**: View count is automatically incremented.

**Errors:**
- `404`: Post not found

---

### GET `/api/posts/slug/:slug`
Get a post by its URL-friendly slug.

**Authentication**: Not required

**URL Parameters:**
- `slug`: URL-friendly identifier (e.g., "getting-started-with-nodejs")

**Response**: Same as GET by ID

---

### PUT `/api/posts/:id`
Update a post.

**Authentication**: Required (Post owner or ADMIN)

**URL Parameters:**
- `id`: Post UUID

**Request Body:** (all fields optional)
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "excerpt": "Updated excerpt",
  "featuredImage": "https://...",
  "categoryId": "category-uuid",
  "tags": ["updated", "tags"],
  "status": "PUBLISHED"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": { ... }
}
```

**Errors:**
- `401`: Not authenticated
- `403`: Not post owner or admin
- `404`: Post not found

---

### DELETE `/api/posts/:id`
Delete a post.

**Authentication**: Required (Post owner or ADMIN)

**URL Parameters:**
- `id`: Post UUID

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

**Errors:**
- `401`: Not authenticated
- `403`: Not post owner or admin
- `404`: Post not found

---

### GET `/api/posts/trending`
Get trending posts (sorted by view count).

**Authentication**: Not required

**Query Parameters:**
- `limit`: Number of posts (default: 5, max: 20)

**Response (200):**
```json
{
  "success": true,
  "message": "Trending posts fetched successfully",
  "data": [ ... ]
}
```

---

### GET `/api/posts/:postId/related`
Get related posts based on category and tags.

**Authentication**: Not required

**URL Parameters:**
- `postId`: Post UUID

**Query Parameters:**
- `limit`: Number of posts (default: 3, max: 10)

**Response (200):**
```json
{
  "success": true,
  "message": "Related posts fetched successfully",
  "data": [ ... ]
}
```

---

### GET `/api/posts/author/:authorId`
Get all posts by a specific author.

**Authentication**: Not required

**URL Parameters:**
- `authorId`: User UUID

**Query Parameters:** Same as GET `/api/posts`

**Response**: Same as GET `/api/posts`

---

### GET `/api/posts/stats`
Get overall post statistics.

**Authentication**: Required (ADMIN only)

**Response (200):**
```json
{
  "success": true,
  "message": "Post statistics fetched successfully",
  "data": {
    "totalPosts": 42,
    "publishedPosts": 35,
    "draftPosts": 7,
    "totalViews": 12543
  }
}
```

**Errors:**
- `401`: Not authenticated
- `403`: Not admin

---

## 💬 Comments Endpoints

### GET `/api/comments/post/:postId`
Get all comments for a post (with nested replies).

**Authentication**: Not required

**URL Parameters:**
- `postId`: Post UUID

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "message": "Comments fetched successfully",
  "data": [
    {
      "id": "uuid",
      "content": "Great post!",
      "status": "APPROVED",
      "createdAt": "2026-02-05T10:30:00.000Z",
      "author": {
        "id": "uuid",
        "username": "johndoe",
        "firstName": "John",
        "avatar": null
      },
      "replies": [
        {
          "id": "uuid",
          "content": "Thanks!",
          "author": { ... },
          "createdAt": "2026-02-05T11:00:00.000Z"
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

---

### POST `/api/comments`
Add a comment to a post.

**Authentication**: Required

**Request Body:**
```json
{
  "content": "This is a great article!",
  "postId": "post-uuid",
  "parentId": "comment-uuid" // optional, for replies
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Comment created successfully",
  "data": {
    "id": "uuid",
    "content": "This is a great article!",
    "status": "PENDING",
    "author": { ... },
    "createdAt": "2026-02-05T10:30:00.000Z"
  }
}
```

**Note**: New comments have `PENDING` status by default.

**Errors:**
- `400`: Invalid postId or post not published
- `401`: Not authenticated

---

### GET `/api/comments/:id`
Get a single comment by ID.

**Authentication**: Not required

**URL Parameters:**
- `id`: Comment UUID

**Response (200):**
```json
{
  "success": true,
  "message": "Comment fetched successfully",
  "data": {
    "id": "uuid",
    "content": "...",
    "author": { ... },
    "post": {
      "id": "uuid",
      "title": "...",
      "slug": "..."
    },
    "replies": [ ... ]
  }
}
```

---

### PUT `/api/comments/:id`
Update own comment.

**Authentication**: Required (Comment owner)

**URL Parameters:**
- `id`: Comment UUID

**Request Body:**
```json
{
  "content": "Updated comment text"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Comment updated successfully",
  "data": { ... }
}
```

**Note**: Status reverts to `PENDING` on update.

**Errors:**
- `401`: Not authenticated
- `403`: Not comment owner
- `404`: Comment not found

---

### DELETE `/api/comments/:id`
Delete own comment.

**Authentication**: Required (Comment owner or ADMIN)

**URL Parameters:**
- `id`: Comment UUID

**Response (200):**
```json
{
  "success": true,
  "message": "Comment deleted successfully"
}
```

**Errors:**
- `401`: Not authenticated
- `403`: Not comment owner or admin
- `404`: Comment not found

---

### PATCH `/api/comments/:id/moderate`
Moderate a comment (approve/reject).

**Authentication**: Required (ADMIN only)

**URL Parameters:**
- `id`: Comment UUID

**Request Body:**
```json
{
  "status": "APPROVED"
}
```

**Status Options:**
- `PENDING`: Awaiting moderation
- `APPROVED`: Visible to all users
- `REJECTED`: Hidden from public

**Response (200):**
```json
{
  "success": true,
  "message": "Comment status updated to APPROVED",
  "data": { ... }
}
```

**Errors:**
- `400`: Invalid status
- `401`: Not authenticated
- `403`: Not admin

---

## ❌ Error Responses

### Common Error Structure
```json
{
  "success": false,
  "error": "Error message here",
  "path": "/api/route" // optional, for 404s
}
```

### Error Messages

#### 400 Bad Request
```json
{
  "success": false,
  "error": "Title and content are required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "error": "No token provided. Please login."
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "error": "You do not have permission to access this resource."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "error": "Post not found",
  "path": "/api/posts/invalid-uuid"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "error": "This email is already registered."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Something went wrong!"
}
```

---

## 📊 Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST (created resource) |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Validation Error | Input validation failed |
| 500 | Internal Error | Unexpected server error |

---

## ⏱️ Rate Limiting

**Current Status**: Not implemented (planned for v2.0)

**Recommended Limits**:
- Authentication endpoints: 5 requests/minute
- Read operations: 100 requests/minute
- Write operations: 20 requests/minute

---

## ✅ Best Practices

### 1. Always Include Authorization Header
```javascript
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### 2. Handle Errors Gracefully
```javascript
try {
  const response = await fetch('/api/posts', { headers });
  const data = await response.json();
  
  if (!data.success) {
    console.error('Error:', data.error);
  }
} catch (error) {
  console.error('Network error:', error);
}
```

### 3. Use Pagination for Large Lists
```javascript
// Fetch posts with pagination
const response = await fetch('/api/posts?page=1&limit=10');
```

### 4. Search with Filters
```javascript
// Combine search with filters
const url = '/api/posts?search=typescript&tags=nodejs,backend&sortBy=viewCount';
```

### 5. Store Token Securely
```javascript
// In browser (consider httpOnly cookies for production)
localStorage.setItem('token', token);

// In Node.js
process.env.JWT_TOKEN = token;
```

### 6. Refresh Expired Tokens
```javascript
if (response.status === 401) {
  // Token expired, redirect to login
  window.location.href = '/login';
}
```

---

## 🔗 Additional Resources

- **[README.md](./README.md)**: Project overview
- **[QUICKSTART.md](./QUICKSTART.md)**: Quick setup guide
- **[Postman Collection](./Blog-CMS-API.postman_collection.json)**: Import for testing
- **[Docker Guide](./DOCKER_DEPLOYMENT.md)**: Deployment documentation

---

## 📝 Changelog

### v1.0.0 (2026-02-05)
- ✅ Initial release
- ✅ Authentication system
- ✅ Post CRUD with advanced features
- ✅ Comment system with nesting
- ✅ Pagination, search, sorting, filtering
- ✅ Error handling & logging

---

<div align="center">
  <p><strong>Built with ❤️ using Node.js, TypeScript, and Express</strong></p>
</div>
