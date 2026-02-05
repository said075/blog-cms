# 📝 Professional Blog CMS API

> A production-ready, enterprise-grade RESTful API for blog and content management, built with modern Node.js technologies.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)

---

## 🎯 What This API Does

A complete, **Upwork-ready** Blog/CMS API with:
- ✅ **User Authentication** (JWT-based, bcrypt password hashing)
- ✅ **Role-Based Access Control** (ADMIN, AUTHOR, READER)
- ✅ **Post Management** (CRUD + advanced features)
- ✅ **Comment System** (with nested replies & moderation)
- ✅ **Advanced Search & Filtering** (full-text search, tags, categories)
- ✅ **Pagination** (with comprehensive metadata)
- ✅ **Professional Error Handling** (global middleware, custom errors)
- ✅ **Production Logging** (Winston + Morgan, file & console)
- ✅ **Docker Support** (one-command deployment)
- ✅ **TypeScript** (100% type-safe)
- ✅ **Clean Architecture** (MVC + Services pattern)

Perfect for freelance projects, portfolio demonstrations, or as a starter for production applications.

---

## 🛠️ Tech Stack

### Core
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.9
- **Framework**: Express.js 5.x
- **Database**: PostgreSQL 15
- **ORM**: Prisma 5.22

### Authentication & Security
- **JWT**: `jsonwebtoken` (token-based authentication)
- **Password Hashing**: `bcrypt` (secure password storage)
- **CORS**: Built-in (cross-origin resource sharing)

### DevOps & Tooling
- **Containerization**: Docker + Docker Compose
- **Development**: Nodemon (hot reload)
- **Logging**: Winston (file logging) + Morgan (HTTP logs)
- **Environment**: dotenv (configuration management)

### Architecture
- **Pattern**: MVC + Service Layer
- **Error Handling**: Global middleware with custom error classes
- **Validation**: Schema-based (Prisma models)
- **Response Format**: Consistent JSON structure

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm
- Docker & Docker Compose (for containerized setup)
- PostgreSQL 15 (if running locally without Docker)

### Option 1: Docker (Recommended) 🐳

**Run the entire system with one command:**

```bash
# Clone the repository
git clone <your-repo-url>
cd blog-cms

# Start everything (API + Database)
docker-compose up -d

# API is now running at http://localhost:3000
```

**That's it!** The API will:
- ✅ Start PostgreSQL database
- ✅ Run migrations automatically
- ✅ Start the API server
- ✅ Be ready for requests

**Test it:**
```bash
curl http://localhost:3000/health
# Response: {"success":true,"message":"API is healthy","data":{"status":"ok"}}
```

**View logs:**
```bash
docker-compose logs -f api
```

**Stop everything:**
```bash
docker-compose down
```

---

### Option 2: Local Development

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Setup Environment
```bash
# Copy example env file
cp .env.example .env

# Update .env with your configuration
# DATABASE_URL=postgresql://postgres:password@localhost:5433/blog_cms?schema=public
# JWT_SECRET=your-secret-key
```

#### 3. Start Database (Docker)
```bash
npm run docker:up
```

#### 4. Run Migrations
```bash
npm run db:migrate
```

#### 5. Start Development Server
```bash
npm run dev
```

Server runs at: `http://localhost:3001`

---

## 📚 API Overview

### Base URL
- **Development**: `http://localhost:3001`
- **Docker**: `http://localhost:3000`

### Authentication
All protected routes require a JWT token in the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### POST `/api/auth/signup`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "user@example.com",
      "username": "johndoe",
      "role": "READER"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/api/auth/login`
Login with existing credentials.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:**
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

### GET `/api/auth/me`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": "...",
    "email": "user@example.com",
    "username": "johndoe",
    "role": "READER",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

## 📝 Post Endpoints

### GET `/api/posts`
Get all posts with filtering, search, pagination, and sorting.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `search` (search in title/content/excerpt)
- `authorId` (filter by author)
- `categoryId` (filter by category)
- `status` (DRAFT, PUBLISHED, ARCHIVED)
- `tags` (comma-separated)
- `sortBy` (createdAt, title, viewCount, publishedAt)
- `sortOrder` (asc, desc)

**Example:**
```bash
GET /api/posts?page=1&limit=10&search=typescript&sortBy=viewCount&sortOrder=desc
```

**Response:**
```json
{
  "success": true,
  "message": "Posts fetched successfully",
  "data": [ ... ],
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

### POST `/api/posts`
Create a new post (requires AUTHOR or ADMIN role).

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "title": "Getting Started with TypeScript",
  "content": "Full post content here...",
  "excerpt": "A brief introduction to TypeScript.",
  "featuredImage": "https://example.com/image.jpg",
  "categoryId": "category-uuid",
  "tags": ["typescript", "programming"],
  "status": "PUBLISHED"
}
```

### GET `/api/posts/:id`
Get a single post by ID.

### GET `/api/posts/slug/:slug`
Get a single post by slug (URL-friendly identifier).

### PUT `/api/posts/:id`
Update a post (requires ownership or ADMIN role).

### DELETE `/api/posts/:id`
Delete a post (requires ownership or ADMIN role).

### GET `/api/posts/trending`
Get trending posts (sorted by view count).

**Query Parameters:**
- `limit` (default: 5)

### GET `/api/posts/:postId/related`
Get related posts (based on category and tags).

### GET `/api/posts/author/:authorId`
Get all posts by a specific author.

### GET `/api/posts/stats`
Get post statistics (requires ADMIN role).

**Response:**
```json
{
  "totalPosts": 42,
  "publishedPosts": 35,
  "draftPosts": 7,
  "totalViews": 12543
}
```

---

## 💬 Comment Endpoints

### GET `/api/comments/post/:postId`
Get all comments for a post (with pagination).

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Comments fetched successfully",
  "data": [
    {
      "id": "...",
      "content": "Great post!",
      "author": { "username": "johndoe", ... },
      "replies": [
        {
          "id": "...",
          "content": "Thanks!",
          "author": { ... }
        }
      ],
      "createdAt": "2026-02-05T..."
    }
  ],
  "pagination": { ... }
}
```

### POST `/api/comments`
Add a comment to a post (requires authentication).

**Request:**
```json
{
  "content": "This is a great article!",
  "postId": "post-uuid",
  "parentId": "comment-uuid" // optional, for replies
}
```

### PUT `/api/comments/:id`
Update own comment (requires authentication).

### DELETE `/api/comments/:id`
Delete own comment (or any comment if ADMIN).

### PATCH `/api/comments/:id/moderate`
Moderate a comment (requires ADMIN role).

**Request:**
```json
{
  "status": "APPROVED" // or "PENDING", "REJECTED"
}
```

---

## 🔍 Response Format

All API responses follow a consistent structure:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... } // optional, for paginated endpoints
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message here",
  "path": "/api/some/route", // for 404 errors
  "stack": "..." // only in development mode
}
```

---

## 👥 User Roles & Permissions

### READER (Default)
- ✅ View published posts
- ✅ Add comments
- ✅ Edit/delete own comments

### AUTHOR
- ✅ All READER permissions
- ✅ Create posts
- ✅ Edit/delete own posts
- ✅ View own draft posts

### ADMIN
- ✅ All AUTHOR permissions
- ✅ Edit/delete any post
- ✅ Moderate comments
- ✅ View post statistics
- ✅ Access all system features

---

## 🗂️ Database Schema

```
User
├── id (UUID)
├── email (unique)
├── username (unique)
├── password (hashed)
├── role (ADMIN, AUTHOR, READER)
├── status (ACTIVE, SUSPENDED, DELETED)
├── firstName, lastName
├── avatar, bio
└── posts, comments (relations)

Post
├── id (UUID)
├── title
├── slug (unique, URL-friendly)
├── content
├── excerpt
├── featuredImage
├── status (DRAFT, PUBLISHED, ARCHIVED)
├── viewCount
├── publishedAt
├── author (relation)
├── category (relation)
├── tags (array)
└── comments (relation)

Comment
├── id (UUID)
├── content
├── status (PENDING, APPROVED, REJECTED)
├── author (relation)
├── post (relation)
├── parent (relation, for nesting)
└── replies (relation)

Category
├── id (UUID)
├── name
├── slug (unique)
├── description
└── posts (relation)
```

---

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Database
npm run db:generate      # Generate Prisma Client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio GUI
npm run db:test          # Test database connection

# Docker
npm run docker:up        # Start database (or all services)
npm run docker:down      # Stop all services
npm run docker:logs      # View logs (all services)
npm run docker:logs:api  # View API logs only
npm run docker:logs:db   # View database logs only
npm run docker:build     # Build Docker images
npm run docker:rebuild   # Rebuild and restart
npm run docker:clean     # Remove all containers and volumes

# Testing
npm run test:auth        # Test authentication flow
npm run test:posts       # Test post CRUD operations
npm run test:production  # Test all production features
npm run setup:test-data  # Setup test database with sample data

# Production
npm run build            # Compile TypeScript
npm start                # Run production server
```

---

## 🧪 Testing

### Automated Test Scripts
```bash
# Test authentication system
npm run test:auth

# Test post CRUD operations
npm run test:posts

# Test all production features (pagination, search, comments, etc.)
npm run test:production
```

### Manual Testing with cURL

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123"}'
```

**Create Post:**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "My First Post",
    "content": "Post content here...",
    "status": "PUBLISHED"
  }'
```

---

## 🐛 Error Handling

The API uses a global error handling middleware with custom error classes:

- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource doesn't exist
- **409 Conflict**: Duplicate resource (e.g., email already exists)
- **422 Validation Error**: Input validation failed
- **500 Internal Server Error**: Unexpected server error

All errors return consistent JSON responses with meaningful messages.

---

## 📝 Logging

### Console Logging
Color-coded logs for development:
- 🟢 **Green**: Successful operations (200-299)
- 🟡 **Yellow**: Client errors (400-499)
- 🔴 **Red**: Server errors (500+)
- 🔵 **Cyan**: Redirects (300-399)

### File Logging
- `logs/combined.log`: All application logs
- `logs/error.log`: Error-level logs only

Logs include timestamps, request details, and stack traces (in development).

---

## 🔒 Security Features

- ✅ **Password Hashing**: bcrypt with salt rounds
- ✅ **JWT Authentication**: Secure, stateless authentication
- ✅ **Role-Based Authorization**: Granular permission control
- ✅ **Input Validation**: Prisma schema validation
- ✅ **SQL Injection Protection**: Prisma ORM prevents SQL injection
- ✅ **CORS**: Configurable cross-origin policies
- ✅ **Environment Variables**: Sensitive data in `.env`
- ✅ **Non-Root Docker User**: Security best practice

---

## 📂 Project Structure

```
blog-cms/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   └── database.ts           # Prisma client singleton
│   ├── controllers/              # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── post.controller.ts
│   │   └── comment.controller.ts
│   ├── services/                 # Business logic
│   │   ├── auth.service.ts
│   │   ├── post.service.ts
│   │   └── comment.service.ts
│   ├── middlewares/              # Express middlewares
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── request-logger.middleware.ts
│   ├── routes/                   # API routes
│   │   ├── auth.routes.ts
│   │   ├── post.routes.ts
│   │   └── comment.routes.ts
│   ├── models/                   # TypeScript interfaces
│   ├── utils/                    # Utility functions
│   │   ├── errors.ts
│   │   ├── logger.ts
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   └── response.ts
│   └── types/                    # TypeScript types/enums
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Migration history
├── logs/                         # Application logs
├── Dockerfile                    # Multi-stage Docker build
├── docker-compose.yml            # Orchestration config
├── .dockerignore                 # Docker build exclusions
├── .env                          # Environment variables
├── .env.example                  # Environment template
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config
└── README.md                     # This file
```

---

## 🌟 Key Features

### 1. Advanced Pagination
```typescript
{
  "pagination": {
    "total": 42,           // Total items
    "page": 1,             // Current page
    "limit": 10,           // Items per page
    "totalPages": 5,       // Total pages
    "hasNextPage": true,   // More items available
    "hasPreviousPage": false
  }
}
```

### 2. Full-Text Search
Search across multiple fields (title, content, excerpt) with case-insensitive matching.

### 3. Dynamic Sorting
Sort by any field: `createdAt`, `publishedAt`, `viewCount`, `title`, etc.

### 4. Multi-Filter Support
Combine filters: author, category, status, tags, search query.

### 5. Nested Comments
Support for threaded discussions with parent-child relationships.

### 6. View Tracking
Automatic view count increment on post access.

### 7. Trending Posts
Get most-viewed posts with configurable limits.

### 8. Related Posts
Intelligent recommendations based on category and tags.

### 9. Comment Moderation
Admin approval workflow with status management.

### 10. Slug Generation
Automatic URL-friendly slugs with uniqueness guarantee.

---

## 🚢 Deployment

### Docker Deployment (Production)
```bash
# Build production image
docker-compose build

# Start in production mode
docker-compose up -d

# View logs
docker-compose logs -f api
```

### Manual Deployment
```bash
# Build TypeScript
npm run build

# Set environment to production
export NODE_ENV=production

# Start server
npm start
```

### Environment Variables (Production)
```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=<strong-random-secret>
JWT_EXPIRES_IN=7d
LOG_LEVEL=info
```

---

## 📖 Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**: Complete API reference with all endpoints
- **[QUICKSTART.md](./QUICKSTART.md)**: 5-minute setup guide
- **[DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md)**: Complete Docker deployment guide
- **[PORTFOLIO_SHOWCASE.md](./PORTFOLIO_SHOWCASE.md)**: Upwork/portfolio presentation
- **[Postman Collection](./Blog-CMS-API.postman_collection.json)**: Importable API testing collection

---

## 🤝 Contributing

This is a portfolio/learning project. Feel free to fork and customize!

---

## 📜 License

ISC License

---

## 👨‍💻 Author

Built as a professional portfolio project demonstrating:
- ✅ Enterprise-grade API architecture
- ✅ Production-ready code quality
- ✅ DevOps best practices (Docker)
- ✅ Comprehensive documentation
- ✅ Security best practices
- ✅ Clean code principles

**Perfect for**: Freelance proposals, job applications, or as a foundation for client projects.

---

## 📞 Support

For questions or feedback:
- Create an issue in the repository
- Contact: [Your Email/LinkedIn]

---

## 🎯 Upwork-Ready Highlights

✅ **Production-Ready**: Not a tutorial project  
✅ **Docker Support**: One-command deployment  
✅ **TypeScript**: 100% type-safe codebase  
✅ **Error Handling**: Professional, predictable errors  
✅ **Logging**: Winston + Morgan integration  
✅ **Testing**: Automated test scripts included  
✅ **Security**: JWT, bcrypt, RBAC, input validation  
✅ **Documentation**: Comprehensive guides for all features  
✅ **Clean Architecture**: MVC + Services, easy to extend  
✅ **Database**: PostgreSQL with Prisma ORM  

**This API demonstrates senior-level backend development skills.**

---

<div align="center">
  <p>⭐ Star this project if you find it useful!</p>
  <p>Made with ❤️ and TypeScript</p>
</div>
