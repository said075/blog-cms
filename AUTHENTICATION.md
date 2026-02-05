# 🔐 Authentication System Documentation

## Overview

This Blog CMS uses **JWT (JSON Web Token)** based authentication with **bcrypt** password hashing.

---

## 🔑 Features

✅ **User Registration** - Signup with email validation  
✅ **Secure Login** - Password hashing with bcrypt  
✅ **JWT Tokens** - Stateless authentication  
✅ **Protected Routes** - Middleware-based protection  
✅ **Role-Based Access** - Admin, Author, Reader roles  
✅ **Password Validation** - Strong password requirements  

---

## 📚 API Endpoints

### 1. Sign Up (Register)

Create a new user account.

```http
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "username",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "role": "READER",
      "status": "ACTIVE",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number

**Username Requirements:**
- 3-20 characters
- Letters, numbers, and underscores only

---

### 2. Login

Authenticate and get JWT token.

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "username",
      "firstName": "John",
      "lastName": "Doe",
      "role": "READER",
      "status": "ACTIVE",
      "emailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Get Current User

Get authenticated user's profile.

```http
GET /api/auth/me
Authorization: Bearer <your-token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "username",
    "firstName": "John",
    "lastName": "Doe",
    "role": "READER",
    "status": "ACTIVE",
    "emailVerified": false
  }
}
```

---

### 4. Change Password

Change authenticated user's password.

```http
PUT /api/auth/change-password
Authorization: Bearer <your-token>
Content-Type: application/json

{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 5. Logout

Logout (client deletes token).

```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully. Please delete your token."
}
```

---

## 🛡️ Using Protected Routes

### In Your Client App

1. **Store the token** after login:
```javascript
// After successful login
const { token } = response.data.data;
localStorage.setItem('token', token);
```

2. **Send token with requests**:
```javascript
// Include in Authorization header
fetch('/api/protected', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

3. **Handle 401 errors**:
```javascript
if (response.status === 401) {
  // Token expired or invalid
  localStorage.removeItem('token');
  redirectToLogin();
}
```

---

## 🔒 Middleware Usage

### authMiddleware

Verifies JWT token and attaches user to request.

```typescript
import { authMiddleware } from './middlewares/auth.middleware';

// Protect a route
router.get('/protected', authMiddleware, (req, res) => {
  // req.user is available
  console.log(req.user.id);
  console.log(req.user.role);
});
```

### requireRole

Checks if user has required role(s).

```typescript
import { requireRole, requireAdmin, requireAuthor } from './middlewares/role.middleware';

// Only ADMIN can access
router.delete('/users/:id', authMiddleware, requireAdmin, deleteUser);

// ADMIN or AUTHOR can access
router.post('/posts', authMiddleware, requireAuthor, createPost);

// Custom roles
router.put('/settings', authMiddleware, requireRole(['ADMIN', 'AUTHOR']), updateSettings);
```

### requireOwnerOrAdmin

Allows resource owner or admin.

```typescript
import { requireOwnerOrAdmin } from './middlewares/role.middleware';

// User can update their own post, or admin can update any
router.put('/posts/:id', 
  authMiddleware, 
  requireOwnerOrAdmin(async (req) => {
    const post = await postService.getPostById(req.params.id);
    return post?.authorId;
  }),
  updatePost
);
```

---

## 🧪 Testing Authentication

### Manual Testing with cURL

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**Protected Route:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Automated Test Suite

Run the automated test script:

```bash
# Make sure server is running
npm run dev

# In another terminal, run tests
npm run test:auth
```

This will test:
- ✅ User signup
- ✅ User login
- ✅ Invalid credentials
- ✅ Protected routes
- ✅ Token validation
- ✅ Role-based access
- ✅ Error handling

---

## 🔧 Configuration

### Environment Variables

```env
# .env file

# JWT Secret (CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# JWT Expiration (default: 7 days)
JWT_EXPIRES_IN=7d
```

**IMPORTANT:** 
- Change `JWT_SECRET` in production
- Use a strong, random string (32+ characters)
- Keep it secret, never commit to Git

### Generate Secure Secret

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# OpenSSL
openssl rand -hex 32
```

---

## 🎯 Role System

### Available Roles

| Role | Description | Can Do |
|------|-------------|---------|
| **READER** | Default role | Read posts, comment |
| **AUTHOR** | Content creator | Create/edit own posts |
| **ADMIN** | System administrator | Full access |

### Default Role

New users get `READER` role by default. Only ADMIN can promote users.

### Checking Roles in Code

```typescript
// In controller/service
if (req.user.role === 'ADMIN') {
  // Admin-only logic
}

if (['ADMIN', 'AUTHOR'].includes(req.user.role)) {
  // Author or Admin logic
}
```

---

## 🔐 Security Best Practices

### ✅ Implemented

1. **Password Hashing** - bcrypt with 10 salt rounds
2. **JWT Expiration** - Tokens expire after 7 days
3. **Secure Headers** - Authorization: Bearer tokens
4. **Role Validation** - Server-side role checks
5. **Password Strength** - Enforced requirements
6. **Email Lowercase** - Consistent email comparison
7. **Account Status** - Inactive accounts can't login

### 🚀 Production Recommendations

1. **HTTPS Only** - Use SSL/TLS in production
2. **Rate Limiting** - Prevent brute force attacks
3. **Email Verification** - Verify email addresses
4. **Refresh Tokens** - Implement token refresh
5. **Password Reset** - Add forgot password flow
6. **2FA** - Two-factor authentication (optional)
7. **Audit Logs** - Track auth events

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Email and password are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Invalid or expired token. Please login again."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You do not have permission to perform this action",
  "requiredRoles": ["ADMIN"],
  "yourRole": "READER"
}
```

---

## 🔄 Authentication Flow

```
1. User signs up
   POST /api/auth/signup
   → Server hashes password
   → Creates user in database
   → Generates JWT token
   → Returns user + token

2. User logs in
   POST /api/auth/login
   → Server verifies credentials
   → Compares password with hash
   → Generates JWT token
   → Updates lastLogin
   → Returns user + token

3. Client stores token
   → Save in localStorage/cookie
   → Include in future requests

4. Access protected route
   → Client sends: Authorization: Bearer <token>
   → authMiddleware verifies token
   → Decodes user info
   → Attaches to req.user
   → Route handler accesses req.user

5. Role-based access
   → requireRole middleware checks req.user.role
   → Allows or denies access
```

---

## 🐛 Troubleshooting

### "No token provided"
**Problem:** Authorization header missing  
**Solution:** Include `Authorization: Bearer <token>` header

### "Invalid or expired token"
**Problem:** Token is invalid or expired  
**Solution:** Login again to get new token

### "You do not have permission"
**Problem:** User role insufficient  
**Solution:** Request admin to upgrade your role

### "This email is already registered"
**Problem:** Email already exists  
**Solution:** Use different email or login

---

## 📚 Code Examples

### Creating Protected Route

```typescript
import { authMiddleware } from './middlewares/auth.middleware';
import { requireAuthor } from './middlewares/role.middleware';

// Protected route (any authenticated user)
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Author/Admin only
router.post('/posts', authMiddleware, requireAuthor, createPost);
```

### Getting Current User in Controller

```typescript
export const createPost = async (req: Request, res: Response) => {
  // req.user is available (set by authMiddleware)
  const authorId = req.user!.id;
  const role = req.user!.role;
  
  // Use in service
  const post = await postService.createPost({
    ...req.body,
    authorId
  });
  
  res.json({ success: true, data: post });
};
```

---

## ✅ Checklist

Day 3 Goals:

- [x] Install bcrypt and jsonwebtoken
- [x] Create password hashing utilities
- [x] Create JWT utilities
- [x] Implement signup endpoint
- [x] Implement login endpoint
- [x] Create auth middleware
- [x] Create role middleware
- [x] Protected routes work with token
- [x] Role-based authorization working
- [x] Test script created

🎉 **Authentication system complete!**

---

## 🚀 Next Steps

1. **Create Post Endpoints** - CRUD operations for blog posts
2. **Add Comments** - Comment system with moderation
3. **User Management** - Admin endpoints for user management
4. **Email Verification** - Send verification emails
5. **Password Reset** - Forgot password flow
6. **Rate Limiting** - Prevent abuse
7. **Refresh Tokens** - Long-lived sessions

Ready to build more features! 🎊
