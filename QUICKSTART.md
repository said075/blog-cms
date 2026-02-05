# ⚡ Quick Start Guide

## 🚀 Get Started in 5 Minutes!

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Database

```bash
# Start PostgreSQL in Docker
npm run docker:up
```

### 3. Setup Database

```bash
# Generate Prisma Client
npm run db:generate

# Run migrations (create tables)
npm run db:migrate
```

### 4. Configure Environment

Make sure `.env` file has:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://postgres:password@localhost:5433/blog_cms?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

### 5. Start Server

```bash
npm run dev
```

Server runs at: **http://localhost:3000**

---

## 🧪 Test Authentication

### Option 1: Automated Test
```bash
# In another terminal (while server is running)
npm run test:auth
```

### Option 2: Manual Test with cURL

**1. Signup:**
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

**2. Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

**3. Copy the token from response, then test protected route:**
```bash
curl http://localhost:3000/api/protected \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Option 3: Use Postman or Thunder Client

1. Import this collection or create requests manually
2. Set Authorization header: `Bearer <token>`
3. Test all endpoints

---

## 📍 Available Endpoints

### Public
- `GET /` - Welcome message
- `GET /health` - Health check
- `POST /api/auth/signup` - Register
- `POST /api/auth/login` - Login

### Protected (Requires Token)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password
- `GET /api/protected` - Demo protected route
- `GET /api/admin` - Demo admin-only route (requires ADMIN role)
- `GET /api/author` - Demo author route (requires AUTHOR/ADMIN role)

---

## 📚 Learn More

- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Complete auth guide
- **[DATABASE_WORKFLOW.md](./DATABASE_WORKFLOW.md)** - Database operations
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - How everything works
- **[README.md](./README.md)** - Full project documentation

---

## 🛠️ Useful Commands

```bash
# Database
npm run docker:up          # Start PostgreSQL
npm run docker:down        # Stop PostgreSQL
npm run db:studio          # Open database GUI

# Development
npm run dev                # Start dev server
npm run test:auth          # Test authentication

# Testing
npm run db:test            # Test database with sample data
```

---

## ✅ Day 3 Complete!

You now have:
- ✅ Secure authentication with JWT
- ✅ Password hashing with bcrypt
- ✅ Protected routes
- ✅ Role-based authorization
- ✅ Working signup/login endpoints

**Next:** Build CRUD endpoints for Posts, Comments, and Users!

---

## 💡 Tips

1. **Token expires in 7 days** - Adjust `JWT_EXPIRES_IN` in `.env`
2. **Use Prisma Studio** - Visual database browser at `npm run db:studio`
3. **Check logs** - Server logs show all requests
4. **Use authMiddleware** - Protect any route by adding it to route handler
5. **Role hierarchy** - ADMIN > AUTHOR > READER

Happy coding! 🎉
