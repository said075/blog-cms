# Blog CMS API

A professional RESTful Blog/CMS API built with Express, TypeScript, and Node.js - perfect for portfolio projects and Upwork applications.

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

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Start the development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build

## API Endpoints

- `GET /` - API welcome message
- `GET /health` - Health check endpoint

## Tech Stack

- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
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
