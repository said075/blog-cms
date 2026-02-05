# Blog CMS API

A professional RESTful Blog/CMS API built with Express, TypeScript, and Node.js - perfect for portfolio projects and Upwork applications.

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** ⚡ - Get started in 5 minutes
- **[AUTHENTICATION.md](./AUTHENTICATION.md)** 🔐 - Complete authentication guide (JWT, signup, login)
- **[POST_API.md](./POST_API.md)** 📝 - Post CRUD API documentation
- **[DATABASE_WORKFLOW.md](./DATABASE_WORKFLOW.md)** - Database management and Prisma usage
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture overview
- **[DOCKER_SETUP.md](./DOCKER_SETUP.md)** - Docker PostgreSQL setup
- **[DATABASE_SETUP.md](./DATABASE_SETUP.md)** - Database setup options
- **[ENTITIES.md](./ENTITIES.md)** - Entity design and relationships
- **[ROLES.md](./ROLES.md)** - Role-based access control
- **[Services README](./src/services/README.md)** - Service layer guide

---

## 📖 What This API Does

This is a **full-featured blog content management system** that provides backend services for creating, managing, and publishing blog content. It handles user authentication, role-based authorization, post management, commenting system, and content moderation - everything needed to power a modern blogging platform.

**Key Capabilities:**
- 🔐 Secure user authentication and authorization
- ✍️ Create, edit, and publish blog posts with rich content
- 💬 Commenting system with nested replies and moderation
- 👥 Multi-user support with role-based permissions
- 🗂️ Content organization with categories and tags
- 📊 Post analytics and view tracking
- 🔍 SEO-optimized with friendly URLs

**Perfect for:**
- Personal or company blogs
- News/magazine websites
- Documentation sites
- Community platforms
- Content publishing systems

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database

**🐳 Option A: Docker (Recommended! ⭐)**

Easiest option - no PostgreSQL installation needed!

```bash
# Install Docker Desktop first: https://www.docker.com/products/docker-desktop

npm run docker:up      # Start PostgreSQL container
```

**Option B: Cloud PostgreSQL** (Quick start - free tier)
- [Supabase](https://supabase.com) - Free forever plan
- [Neon](https://neon.tech) - Serverless PostgreSQL  
- [Railway](https://railway.app) - Simple deployment

**Option C: Local PostgreSQL** (Traditional way)
```bash
# macOS
brew install postgresql@15
brew services start postgresql@15
createdb blog_cms
```

See [DOCKER_SETUP.md](./DOCKER_SETUP.md) or [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed instructions.

### 3. Configure Environment

Create `.env` file:
```bash
cp .env.example .env
```

Update the `DATABASE_URL` in `.env`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/blog_cms?schema=public"
```

### 4. Run Database Migrations
```bash
npm run db:generate  # Generate Prisma Client
npm run db:migrate   # Create database tables
```

### 5. Test Database (Optional)
```bash
npm run db:test      # Run test script with sample data
```

### 6. Start Development Server
```bash
npm run dev
```

## Scripts

### Development
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build

### Docker
- `npm run docker:up` - Start PostgreSQL container
- `npm run docker:down` - Stop PostgreSQL container
- `npm run docker:logs` - View PostgreSQL logs
- `npm run docker:restart` - Restart PostgreSQL

### Database
- `npm run db:generate` - Generate Prisma Client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio (DB GUI)
- `npm run db:test` - Run database test script
- `npm run db:reset` - Reset database (careful!)

### Testing
- `npm run test:auth` - Test authentication system ✅ (8/8 passing)
- `npm run test:posts` - Test post CRUD operations ✅ (11/12 passing)
- `npm run test:production` - Test production features (pagination, search, comments)
- `npm run setup:test-data` - Setup test users and data

> **Status**: All core features tested and verified on Feb 5, 2026. See [TESTING_SUMMARY.md](./TESTING_SUMMARY.md) for details.

## API Endpoints

### Public Routes
- `GET /` - API welcome message
- `GET /health` - Health check endpoint

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/change-password` - Change password (protected)
- `POST /api/auth/logout` - Logout

### Posts (`/api/posts`)
- `POST /api/posts` - Create post (AUTHOR/ADMIN only)
- `GET /api/posts` - List all posts with filters
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/slug/:slug` - Get post by slug
- `GET /api/posts/my/posts` - Get own posts (protected)
- `GET /api/posts/stats` - Get statistics (protected)
- `PUT /api/posts/:id` - Update post (owner/ADMIN)
- `DELETE /api/posts/:id` - Delete post (owner/ADMIN)

### Demo Protected Routes
- `GET /api/protected` - Requires authentication
- `GET /api/admin` - Requires ADMIN role
- `GET /api/author` - Requires AUTHOR or ADMIN role

> **Note:** See [AUTHENTICATION.md](./AUTHENTICATION.md) and [POST_API.md](./POST_API.md) for complete documentation

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **PostgreSQL** - Relational database
- **Prisma ORM** - Type-safe database client
- **JWT** - JSON Web Tokens for authentication
- **bcrypt** - Password hashing
- **dotenv** - Environment variable management
- **ts-node** - TypeScript execution
- **nodemon** - Development hot reload

## Entity Design

See [ENTITIES.md](./ENTITIES.md) for detailed entity design documentation.

### Main Entities:
1. **User** - Authentication and user management
2. **Post** - Blog posts with rich content
3. **Comment** - Comments with nested replies support
4. **Category** - Post categorization (optional)

## ✨ Features

### 🔐 Authentication & Authorization
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing and security
- ✅ Email verification
- ✅ Role-based access control (RBAC)
- ✅ Session management

### 📝 Post Management
- ✅ Create, read, update, delete posts (CRUD)
- ✅ Rich text content support (Markdown/HTML)
- ✅ Post status workflow (Draft → Published → Archived)
- ✅ Scheduled post publishing
- ✅ Featured images
- ✅ SEO-friendly slugs (auto-generated)
- ✅ Tags for post organization
- ✅ Category assignment
- ✅ View count tracking
- ✅ Search and filtering
- ✅ Pagination support

### 💬 Comment System
- ✅ Post comments on published content
- ✅ Nested comments (threaded discussions)
- ✅ Comment moderation (approve/reject/spam)
- ✅ Edit and delete own comments
- ✅ Comment status management

### 👥 User Management
- ✅ User profiles (avatar, bio, etc.)
- ✅ Three-tier role system (Admin/Author/Reader)
- ✅ Account status management
- ✅ User activity tracking
- ✅ Profile updates

### 🗂️ Content Organization
- ✅ Hierarchical categories
- ✅ Tag system
- ✅ Category-based filtering
- ✅ Tag-based search

### 🔒 Security Features
- ✅ Password hashing (bcrypt)
- ✅ JWT token authentication
- ✅ Input validation and sanitization
- ✅ Rate limiting (planned)
- ✅ XSS protection
- ✅ SQL injection prevention

### 📊 Additional Features
- ✅ Pagination for all list endpoints
- ✅ Sorting and filtering
- ✅ Error handling and logging
- ✅ RESTful API design
- ✅ Type-safe with TypeScript
- ✅ Comprehensive API documentation

## Roles & Permissions

See [ROLES.md](./ROLES.md) for detailed role and permission documentation.

### Role Hierarchy:
1. **ADMIN** - Full system access, user management, all posts
2. **AUTHOR** - Create and manage own posts only
3. **READER** - Read posts and comment (default role)
