# 🏗️ Blog CMS Architecture

## Overview

This document explains how all the pieces fit together.

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       CLIENT (Frontend)                      │
│                   React, Vue, Mobile App                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │ (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      EXPRESS SERVER                          │
│                     (src/server.ts)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      MIDDLEWARE                              │
│  ┌────────────┐  ┌────────────┐  ┌─────────────────────┐  │
│  │   Auth     │  │ Validation │  │   Error Handler     │  │
│  │ Middleware │  │ Middleware │  │    Middleware       │  │
│  └────────────┘  └────────────┘  └─────────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        ROUTES                                │
│  /api/auth    /api/users    /api/posts    /api/comments    │
│  (src/routes/)                                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      CONTROLLERS                             │
│         Handle HTTP Request/Response Logic                   │
│              (src/controllers/)                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       SERVICES                               │
│              Business Logic & Data Operations                │
│         user.service   post.service   comment.service        │
│                  (src/services/)                             │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   PRISMA CLIENT                              │
│              Type-safe Database Access                       │
│              (src/config/database.ts)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 POSTGRESQL DATABASE                          │
│            (Docker Container - Port 5433)                    │
│    users, posts, comments, categories tables                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Request Flow Example

### Example: Creating a Blog Post

```
1. CLIENT
   POST /api/posts
   Body: { title, content, ... }
   Header: Authorization: Bearer <token>
   
   ↓

2. EXPRESS SERVER
   Receives HTTP request
   
   ↓

3. MIDDLEWARE CHAIN
   a. Auth Middleware
      → Verify JWT token
      → Extract user info
      → Attach to req.user
   
   b. Validation Middleware
      → Validate request body
      → Check required fields
      → Sanitize input
   
   ↓

4. ROUTE HANDLER
   POST /api/posts → postController.createPost()
   
   ↓

5. CONTROLLER
   postController.createPost(req, res)
   → Extract data from req.body
   → Call service layer
   
   ↓

6. SERVICE
   postService.createPost(data)
   → Apply business logic
   → Check permissions
   → Generate slug
   → Call Prisma Client
   
   ↓

7. PRISMA CLIENT
   prisma.post.create({ data })
   → Generate SQL
   → Execute query
   
   ↓

8. POSTGRESQL
   INSERT INTO posts (...)
   → Save to database
   → Return saved data
   
   ↓

9. RESPONSE FLOW (Reverse Order)
   Database → Prisma → Service → Controller → Express → Client
   
   Response: {
     success: true,
     data: { id, title, slug, ... }
   }
```

---

## 📂 Project Structure Explained

```
blog-cms/
│
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   ├── migrations/            # Database version history
│   └── seed.ts               # Sample data (optional)
│
├── src/
│   ├── config/
│   │   └── database.ts       # Prisma Client singleton
│   │
│   ├── models/               # TypeScript interfaces
│   │   ├── user.model.ts     # User types & interfaces
│   │   ├── post.model.ts     # Post types & interfaces
│   │   └── comment.model.ts  # Comment types & interfaces
│   │
│   ├── services/             # Business logic
│   │   ├── user.service.ts   # User CRUD operations
│   │   ├── post.service.ts   # Post CRUD operations
│   │   └── auth.service.ts   # Authentication logic
│   │
│   ├── controllers/          # HTTP request handlers
│   │   ├── user.controller.ts
│   │   ├── post.controller.ts
│   │   └── auth.controller.ts
│   │
│   ├── routes/               # API endpoint definitions
│   │   ├── user.routes.ts    # /api/users/*
│   │   ├── post.routes.ts    # /api/posts/*
│   │   └── auth.routes.ts    # /api/auth/*
│   │
│   ├── middlewares/          # Request processing
│   │   ├── auth.middleware.ts      # JWT verification
│   │   ├── validation.middleware.ts # Input validation
│   │   └── error.middleware.ts     # Error handling
│   │
│   ├── utils/                # Helper functions
│   │   ├── jwt.ts            # JWT utilities
│   │   ├── password.ts       # Bcrypt utilities
│   │   └── slugify.ts        # URL slug generation
│   │
│   ├── types/                # Type definitions
│   │   ├── enums.ts          # Enums (UserRole, etc.)
│   │   └── api.types.ts      # API response types
│   │
│   ├── app.ts                # Express app setup
│   └── server.ts             # Server startup
│
├── docker-compose.yml        # Docker configuration
├── .env                      # Environment variables
└── package.json              # Dependencies & scripts
```

---

## 🔑 Key Concepts

### 1. Layered Architecture

**Separation of Concerns** - Each layer has specific responsibility:

```
Routes → "What endpoints exist?"
Controllers → "How to handle HTTP?"
Services → "What's the business logic?"
Database → "How to store data?"
```

**Benefits:**
- Easy to test each layer independently
- Changes in one layer don't affect others
- Code is more organized and maintainable

### 2. Dependency Flow

```
Controllers depend on Services
Services depend on Database
(NOT the other way around!)
```

### 3. Data Flow

```
Request → Raw Data → Validated Data → Business Logic → Database
                                                           ↓
Response ← Formatted ← Transformed ← Processed ← Database Result
```

---

## 🛠️ How to Add New Features

### Example: Adding "Likes" Feature

#### 1. Update Database Schema

```typescript
// prisma/schema.prisma
model Like {
  id        String   @id @default(uuid())
  postId    String
  userId    String
  createdAt DateTime @default(now())
  
  post Post @relation(fields: [postId], references: [id])
  user User @relation(fields: [userId], references: [id])
  
  @@unique([postId, userId])
}
```

Run migration:
```bash
npm run db:migrate
```

#### 2. Create Model Types

```typescript
// src/models/like.model.ts
export interface ILike {
  id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}
```

#### 3. Create Service

```typescript
// src/services/like.service.ts
export class LikeService {
  async likePost(postId: string, userId: string) {
    return await prisma.like.create({
      data: { postId, userId }
    });
  }
  
  async unlikePost(postId: string, userId: string) {
    return await prisma.like.delete({
      where: { postId_userId: { postId, userId } }
    });
  }
}
```

#### 4. Create Controller

```typescript
// src/controllers/like.controller.ts
import likeService from '../services/like.service';

export const likePost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.id; // From auth middleware
  
  const like = await likeService.likePost(postId, userId);
  res.json({ success: true, data: like });
};
```

#### 5. Create Routes

```typescript
// src/routes/like.routes.ts
import { Router } from 'express';
import { likePost, unlikePost } from '../controllers/like.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/:postId/like', authMiddleware, likePost);
router.delete('/:postId/like', authMiddleware, unlikePost);

export default router;
```

#### 6. Register Routes

```typescript
// src/app.ts
import likeRoutes from './routes/like.routes';

app.use('/api/posts', likeRoutes);
```

**Done! Your API now has:**
- `POST /api/posts/:postId/like` - Like a post
- `DELETE /api/posts/:postId/like` - Unlike a post

---

## 🔐 Security Flow

### Authentication Process

```
1. User logs in
   POST /api/auth/login
   { email, password }
   
2. Server verifies credentials
   → Check database
   → Compare hashed passwords
   
3. Generate JWT token
   → Sign with secret key
   → Include user info
   
4. Return token
   { token: "eyJhbGc..." }
   
5. Client stores token
   → LocalStorage or Cookie
   
6. Client sends token with requests
   Authorization: Bearer <token>
   
7. Server verifies token
   → Auth middleware
   → Decode & validate
   → Attach user to request
   
8. Protected route accessed
   → req.user available
   → Check permissions
```

---

## 📊 Database Management

### Development Workflow

```bash
# Day-to-day development

1. Start database
   npm run docker:up

2. Make schema changes
   # Edit prisma/schema.prisma

3. Create migration
   npm run db:migrate
   # Name: "add_likes_feature"

4. View database
   npm run db:studio

5. Start dev server
   npm run dev
```

### Migration Workflow

```
Local Development:
  schema change → db:migrate → test locally

Git:
  commit migration files → push to repository

Production:
  pull from git → prisma migrate deploy → restart server
```

---

## 🎯 Best Practices

### 1. Error Handling

```typescript
// ✅ GOOD: Catch and handle errors
try {
  const user = await userService.createUser(data);
  res.json({ success: true, data: user });
} catch (error) {
  res.status(500).json({ success: false, error: error.message });
}
```

### 2. Input Validation

```typescript
// ✅ GOOD: Validate before processing
if (!email || !isValidEmail(email)) {
  return res.status(400).json({ error: 'Invalid email' });
}
```

### 3. Security

```typescript
// ✅ GOOD: Exclude sensitive data
select: {
  id: true,
  email: true,
  username: true
  // password NOT selected
}
```

### 4. Consistent Response Format

```typescript
// ✅ GOOD: Consistent structure
{ success: true, data: { ... } }
{ success: false, error: "message" }
```

---

## 🚀 Next Steps

Now that you understand the architecture:

1. ✅ Implement authentication system
2. ✅ Create API endpoints (CRUD)
3. ✅ Add validation middleware
4. ✅ Implement error handling
5. ✅ Add rate limiting
6. ✅ Write tests
7. ✅ Deploy to production

Ready to build your API! 🎉
