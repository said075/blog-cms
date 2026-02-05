# 🐳 Docker PostgreSQL Setup Guide

## Why Docker?

✅ **No installation** - No need to install PostgreSQL on your system  
✅ **Consistent** - Same environment for everyone  
✅ **Isolated** - Doesn't interfere with other projects  
✅ **Easy cleanup** - Remove container when done  
✅ **Portable** - Works on macOS, Linux, and Windows  

---

## Prerequisites

### Install Docker Desktop

**macOS:**
```bash
# Using Homebrew
brew install --cask docker

# Or download from: https://www.docker.com/products/docker-desktop
```

**Windows:**
- Download Docker Desktop from: https://www.docker.com/products/docker-desktop
- Enable WSL 2 during installation

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker
```

Verify installation:
```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start (3 Steps!)

### 1. Start PostgreSQL Container

```bash
npm run docker:up
```

This will:
- Download PostgreSQL 15 Alpine image (if not already downloaded)
- Start PostgreSQL container on port 5432
- Create database named `blog_cms`
- Set up persistent storage volume

### 2. Run Database Migrations

```bash
npm run db:generate   # Generate Prisma Client
npm run db:migrate    # Create all tables
```

### 3. Test Your Database

```bash
npm run db:test       # Run test script with sample data
```

**That's it! Your database is ready! 🎉**

---

## 🛠️ Docker Commands

### Container Management

```bash
# Start PostgreSQL
npm run docker:up

# Stop PostgreSQL (keeps data)
npm run docker:down

# View PostgreSQL logs
npm run docker:logs

# Restart PostgreSQL
npm run docker:restart

# Check container status
docker ps

# Stop and remove everything (including data)
docker-compose down -v
```

### Direct Docker Commands

```bash
# Access PostgreSQL CLI
docker exec -it blog-cms-postgres psql -U postgres -d blog_cms

# View container logs
docker logs blog-cms-postgres

# Check container health
docker inspect blog-cms-postgres | grep Status

# Stop container
docker stop blog-cms-postgres

# Start container
docker start blog-cms-postgres

# Remove container (keeps volume)
docker rm blog-cms-postgres

# Remove container and volume (deletes all data)
docker-compose down -v
```

---

## 📊 Database Management

### Access PostgreSQL Shell

```bash
# Method 1: Using docker exec
docker exec -it blog-cms-postgres psql -U postgres -d blog_cms

# Method 2: Using psql (if installed)
psql postgresql://postgres:password@localhost:5432/blog_cms
```

### Common SQL Commands

```sql
-- List all tables
\dt

-- Describe table structure
\d users
\d posts
\d comments

-- Count records
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM posts;

-- View all users
SELECT id, username, email, role FROM users;

-- Exit psql
\q
```

### Visual Database Browser

```bash
# Open Prisma Studio (recommended)
npm run db:studio

# Access at: http://localhost:5555
```

---

## 🔧 Configuration

### Default Settings

The `docker-compose.yml` uses these defaults:

```yaml
Database: blog_cms
User: postgres
Password: password
Port: 5432
Host: localhost
```

### Custom Configuration

Create `docker-compose.override.yml` for custom settings:

```yaml
version: '3.8'

services:
  postgres:
    environment:
      POSTGRES_PASSWORD: my_secure_password
    ports:
      - "5433:5432"  # Use different port
```

Or modify environment variables:

```bash
# .env file
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/blog_cms?schema=public"
```

---

## 🔍 Troubleshooting

### Port 5432 Already in Use

**Problem:** Another PostgreSQL instance is running

**Solution 1:** Stop local PostgreSQL
```bash
# macOS (Homebrew)
brew services stop postgresql

# Linux
sudo systemctl stop postgresql
```

**Solution 2:** Use different port
```yaml
# docker-compose.yml
ports:
  - "5433:5432"

# .env
DATABASE_URL="postgresql://postgres:password@localhost:5433/blog_cms?schema=public"
```

### Container Won't Start

**Problem:** Docker daemon not running

**Solution:**
```bash
# macOS/Windows: Open Docker Desktop

# Linux
sudo systemctl start docker
```

### Cannot Connect to Database

**Problem:** Container is starting up

**Solution:** Wait a few seconds, check health:
```bash
docker ps
# Look for "healthy" status

# Or check logs
npm run docker:logs
```

### Data Persistence Issues

**Problem:** Data disappears when container stops

**Solution:** Verify volume exists:
```bash
docker volume ls | grep blog-cms

# If missing, recreate:
docker-compose down
docker-compose up -d
```

### Permission Denied Errors

**Problem:** Docker requires sudo on Linux

**Solution:** Add user to docker group:
```bash
sudo usermod -aG docker $USER
newgrp docker
```

---

## 🗄️ Data Management

### Backup Database

```bash
# Export database to SQL file
docker exec -t blog-cms-postgres pg_dump -U postgres blog_cms > backup.sql

# Or use Prisma
npx prisma db push --force-reset
```

### Restore Database

```bash
# From SQL file
docker exec -i blog-cms-postgres psql -U postgres blog_cms < backup.sql

# Or reset and re-migrate
npm run db:reset
```

### Reset Database

```bash
# Option 1: Prisma reset (recommended)
npm run db:reset

# Option 2: Drop and recreate
docker exec -it blog-cms-postgres psql -U postgres -c "DROP DATABASE blog_cms;"
docker exec -it blog-cms-postgres psql -U postgres -c "CREATE DATABASE blog_cms;"
npm run db:migrate

# Option 3: Nuclear option (delete everything)
docker-compose down -v
npm run docker:up
npm run db:migrate
```

---

## 🚀 Production Deployment

### Don't Use Docker Compose in Production!

For production, use managed PostgreSQL services:

- **Supabase** - Free tier, managed PostgreSQL
- **Neon** - Serverless PostgreSQL
- **Railway** - Simple deployment
- **AWS RDS** - Enterprise-grade
- **Heroku Postgres** - Easy deployment
- **DigitalOcean Managed Databases** - Affordable

### Environment-Specific Setup

```bash
# Development (Docker)
DATABASE_URL="postgresql://postgres:password@localhost:5432/blog_cms?schema=public"

# Production (Cloud)
DATABASE_URL="your-production-database-url"
```

---

## 📋 Complete Workflow

### First Time Setup

```bash
# 1. Start Docker
npm run docker:up

# 2. Generate Prisma Client
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Test database
npm run db:test

# 5. Start development server
npm run dev
```

### Daily Development

```bash
# Start database (if not running)
npm run docker:up

# Start development server
npm run dev

# View database
npm run db:studio
```

### Shutdown

```bash
# Stop containers (keeps data)
npm run docker:down

# Or just stop Docker Desktop
```

---

## 🎯 Next Steps

✅ PostgreSQL running in Docker  
✅ Database schema created  
✅ Test data loaded  

Now you can:
1. 🚀 Start building your API endpoints
2. 🔐 Implement authentication
3. 📝 Create CRUD operations
4. 🎨 Build your frontend

---

## 📚 Additional Resources

- Docker Documentation: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- PostgreSQL Docker Hub: https://hub.docker.com/_/postgres
- Prisma + Docker: https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker

---

## ✨ Pro Tips

1. **Always use volumes** for data persistence
2. **Use Alpine images** for smaller size
3. **Set health checks** for reliability
4. **Use .env files** for sensitive data
5. **Don't commit docker-compose.override.yml**
6. **Monitor container resources** with `docker stats`
7. **Use Docker Desktop UI** for easy management
8. **Back up before migrations** in production
