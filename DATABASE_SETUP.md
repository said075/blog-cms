# PostgreSQL Database Setup Guide

## 🎯 Overview

This project uses **PostgreSQL** with **Prisma ORM** for database management. You have several options for running PostgreSQL.

---

## 🐳 Option 1: Docker (Recommended! ⭐)

**The easiest and cleanest way to run PostgreSQL!**

### Quick Start (3 commands!)

```bash
npm run docker:up      # Start PostgreSQL in Docker
npm run db:migrate     # Create database tables
npm run db:test        # Test with sample data
```

**See [DOCKER_SETUP.md](./DOCKER_SETUP.md) for complete Docker guide.**

### Requirements
- Install Docker Desktop: https://www.docker.com/products/docker-desktop
- That's it! No PostgreSQL installation needed.

### Why Docker?
✅ No PostgreSQL installation required  
✅ Clean and isolated  
✅ Same environment for everyone  
✅ Easy cleanup  
✅ Works on all platforms  

---

## 📋 Option 2: Local PostgreSQL Installation

### macOS (Using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create database
createdb blog_cms

# Access PostgreSQL CLI
psql blog_cms
```

### macOS (Using Postgres.app)

1. Download from: https://postgresapp.com/
2. Install and launch Postgres.app
3. Click "Initialize" to create a new server
4. Database will be available at `postgresql://localhost:5432`

### Ubuntu/Debian Linux

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb blog_cms

# Create user (optional)
sudo -u postgres psql
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE blog_cms TO your_username;
```

### Windows

1. Download installer from: https://www.postgresql.org/download/windows/
2. Run the installer
3. Use pgAdmin (included) or command line
4. Create database named `blog_cms`

---

## ☁️ Option 3: Cloud PostgreSQL (Free Tiers Available)

### Supabase (Recommended - Free Forever Plan)

1. Go to https://supabase.com
2. Create a new project
3. Copy the connection string from Settings → Database
4. Update your `.env` file:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Neon (Serverless PostgreSQL - Free Tier)

1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update your `.env` file

### Railway (Simple Deployment - Free Trial)

1. Go to https://railway.app
2. Create a new project → Add PostgreSQL
3. Copy the DATABASE_URL from Variables tab
4. Update your `.env` file

### Heroku Postgres (Free Tier Available)

1. Install Heroku CLI
2. Run: `heroku addons:create heroku-postgresql:mini`
3. Get connection string: `heroku config:get DATABASE_URL`
4. Update your `.env` file

---

## 🔧 Configure Your Project

### 1. Update `.env` file

```env
PORT=3000
NODE_ENV=development

# PostgreSQL Connection String
# Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public

# For local PostgreSQL:
DATABASE_URL="postgresql://postgres:password@localhost:5432/blog_cms?schema=public"

# Or use your cloud provider's connection string
```

### 2. Generate Prisma Client

```bash
npm run db:generate
```

### 3. Run Database Migrations

```bash
npm run db:migrate
```

This will:
- Create all tables (users, posts, comments, categories)
- Set up relationships and indexes
- Apply the schema to your database

---

## 🧪 Test Your Database

Run the test script to verify everything works:

```bash
npm run db:test
```

This script will:
- ✅ Create test users (admin, author, reader)
- ✅ Create a category
- ✅ Create sample posts
- ✅ Create comments with replies
- ✅ Fetch and display all data
- ✅ Show database statistics

---

## 🛠️ Useful Commands

```bash
# Open Prisma Studio (Database GUI)
npm run db:studio

# Generate Prisma Client after schema changes
npm run db:generate

# Create and apply migrations
npm run db:migrate

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# View database with Prisma Studio
npm run db:studio

# Run test script
npm run db:test
```

---

## 📊 Database Schema

Our database includes:

### Tables:
- **users** - User accounts with authentication
- **posts** - Blog posts with rich content
- **comments** - Comments with nested replies
- **categories** - Post categories with hierarchy

### Features:
- UUID primary keys
- Foreign key relationships with cascade deletes
- Indexes on frequently queried fields
- Timestamps (createdAt, updatedAt)
- Enums for status fields

---

## 🔍 Verify Your Setup

### Check Connection

```bash
# Using psql
psql $DATABASE_URL

# Or check with Prisma
npx prisma db push
```

### View Tables

```sql
-- In psql
\dt

-- List all tables
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Count Records

```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM posts;
SELECT COUNT(*) FROM comments;
```

---

## 🚨 Troubleshooting

### "Connection refused" error

**Problem:** PostgreSQL is not running

**Solution:**
```bash
# macOS (Homebrew)
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Check if running
pg_isready
```

### "database does not exist" error

**Problem:** Database hasn't been created

**Solution:**
```bash
createdb blog_cms
# or
psql -U postgres -c "CREATE DATABASE blog_cms;"
```

### "role does not exist" error

**Problem:** PostgreSQL user doesn't exist

**Solution:**
```bash
# Create user
psql -U postgres -c "CREATE USER your_username WITH PASSWORD 'your_password';"

# Or use default 'postgres' user in your DATABASE_URL
```

### Authentication failed

**Problem:** Wrong password in connection string

**Solution:**
- Check your `.env` DATABASE_URL
- Verify username/password
- For local development, you might need to update `pg_hba.conf`

---

## 🔐 Security Notes

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Use strong passwords** for production databases
3. **Rotate credentials** regularly
4. **Use connection pooling** in production
5. **Enable SSL** for cloud databases

---

## 📚 Additional Resources

- Prisma Documentation: https://www.prisma.io/docs
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- Prisma Schema Reference: https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference
- Database Best Practices: https://www.prisma.io/docs/guides/performance-and-optimization

---

## ✅ Next Steps

Once your database is set up:

1. ✅ Run migrations: `npm run db:migrate`
2. ✅ Test the connection: `npm run db:test`
3. ✅ Explore data: `npm run db:studio`
4. 🚀 Start building your API!
