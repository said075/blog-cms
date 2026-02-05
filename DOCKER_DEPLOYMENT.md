# 🐳 Docker Deployment Guide

Complete guide to running the Blog CMS API with Docker.

---

## 📋 Prerequisites

- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))
- Docker Compose installed (included with Docker Desktop)

Check installation:
```bash
docker --version
docker-compose --version
```

---

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone <your-repo>
cd blog-cms
```

### 2. Configure Environment (Optional)
The app works with default settings, but you can customize:

```bash
# Set custom JWT secret (recommended for production)
export JWT_SECRET="your-very-long-random-secret-key"
```

### 3. Start Everything
```bash
docker-compose up -d
```

That's it! 🎉

The API is now running at: **http://localhost:3000**

---

## 📦 What's Running?

After `docker-compose up`, you'll have:

### 1. **PostgreSQL Database**
- Port: `5433:5432`
- User: `postgres`
- Password: `password`
- Database: `blog_cms`

### 2. **Blog CMS API**
- Port: `3000:3000`
- Auto-runs migrations
- Connected to database
- Health check enabled

---

## 🔧 Docker Commands

### Basic Operations
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs (all services)
docker-compose logs -f

# View API logs only
npm run docker:logs:api

# View database logs only
npm run docker:logs:db

# Restart services
docker-compose restart

# Check status
docker-compose ps
```

### Build & Rebuild
```bash
# Build images
npm run docker:build

# Rebuild and restart
npm run docker:rebuild

# Full clean rebuild
npm run docker:clean
docker-compose up -d --build
```

### Advanced
```bash
# Access API container shell
docker exec -it blog-cms-api sh

# Access PostgreSQL
docker exec -it blog-cms-postgres psql -U postgres -d blog_cms

# View container resource usage
docker stats
```

---

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-05T..."
}
```

### API Info
```bash
curl http://localhost:3000/
```

### Test Authentication
```bash
# Signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

### Test with Postman
1. Import collection (if provided)
2. Base URL: `http://localhost:3000`
3. Test all endpoints

---

## 📁 Docker Setup Files

```
blog-cms/
├── Dockerfile              # Multi-stage build for API
├── docker-compose.yml      # Orchestration (API + DB)
├── .dockerignore          # Files to exclude from image
└── .env.example           # Environment variables template
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         Docker Compose              │
│                                     │
│  ┌──────────────┐  ┌─────────────┐ │
│  │   API (3000) │──│ PostgreSQL  │ │
│  │              │  │   (5432)    │ │
│  │  Node.js     │  │             │ │
│  │  Express     │  │   Data      │ │
│  │  TypeScript  │  │   Volume    │ │
│  └──────────────┘  └─────────────┘ │
│         │                           │
│         │                           │
└─────────┼───────────────────────────┘
          │
          ↓
     Host Port 3000
```

---

## 🔐 Security Features

### 1. **Non-Root User**
API runs as user `nodejs` (UID 1001), not root.

### 2. **Multi-Stage Build**
- Builder stage: Compiles TypeScript
- Production stage: Only runtime files
- Smaller image, fewer vulnerabilities

### 3. **Health Checks**
Both services have health checks:
- API: HTTP GET `/health`
- Database: `pg_isready`

### 4. **Isolated Network**
Services communicate on private `blog-network`.

---

## 📊 Container Details

### API Container
```dockerfile
Base Image: node:20-alpine
Size: ~200MB (optimized)
User: nodejs (non-root)
Health Check: Every 30s
Auto-restart: unless-stopped
```

### Database Container
```dockerfile
Base Image: postgres:15-alpine
Size: ~250MB
Persistent Volume: postgres_data
Health Check: Every 10s
Auto-restart: unless-stopped
```

---

## 🐛 Troubleshooting

### API won't start
```bash
# Check logs
docker-compose logs api

# Common issues:
# 1. Database not ready - wait 30s and check again
# 2. Port 3000 already in use - change in docker-compose.yml
# 3. Migration failed - check DATABASE_URL
```

### Database connection failed
```bash
# Verify database is healthy
docker-compose ps

# Should show "healthy" status
# If not, check logs:
docker-compose logs postgres
```

### Cannot access API
```bash
# Verify port is exposed
docker-compose ps

# Should show: 0.0.0.0:3000->3000/tcp

# Test from inside container
docker exec blog-cms-api wget -O- http://localhost:3000/health
```

### Reset everything
```bash
# Stop and remove all containers and volumes
docker-compose down -v

# Remove images
docker rmi blog-cms-api

# Start fresh
docker-compose up -d --build
```

---

## 🔄 Development Workflow

### Local Development (Recommended)
```bash
# Use local Node.js and Docker PostgreSQL
npm run docker:up     # Start only database
npm run dev          # Run API locally
```

### Full Docker Development
```bash
# Use Docker for everything
docker-compose up

# Make code changes
# Rebuild and restart
docker-compose up -d --build
```

### Production Deployment
```bash
# Build optimized image
docker-compose build

# Run in production mode
docker-compose up -d
```

---

## 📈 Monitoring

### View Resource Usage
```bash
docker stats blog-cms-api blog-cms-postgres
```

### View Logs in Real-Time
```bash
# All services
docker-compose logs -f

# API only
docker-compose logs -f api

# With timestamps
docker-compose logs -f -t api
```

### Check Health Status
```bash
# Via Docker
docker inspect blog-cms-api | grep -A 10 Health

# Via API
curl http://localhost:3000/health
```

---

## 🌐 Environment Variables

### Default Values (docker-compose.yml)
```yaml
NODE_ENV: production
PORT: 3000
DATABASE_URL: postgresql://postgres:password@postgres:5432/blog_cms
JWT_SECRET: (set via environment or uses default)
JWT_EXPIRES_IN: 7d
LOG_LEVEL: info
```

### Override with .env file
Create `.env` in project root:
```bash
JWT_SECRET=your-custom-secret
LOG_LEVEL=debug
```

### Override on command line
```bash
JWT_SECRET="my-secret" docker-compose up -d
```

---

## 🚀 Production Deployment

### Recommended Changes

1. **Change Passwords**
```yaml
# docker-compose.yml
POSTGRES_PASSWORD: ${DB_PASSWORD}
```

2. **Use External Database** (Optional)
```yaml
# Remove postgres service
# Update DATABASE_URL to point to cloud database
```

3. **Add SSL/TLS**
```yaml
# Use nginx or traefik as reverse proxy
```

4. **Enable Log Aggregation**
```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

5. **Resource Limits**
```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '1'
        memory: 512M
```

---

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/main/docs/BestPractices.md)
- [PostgreSQL Docker Hub](https://hub.docker.com/_/postgres)

---

## ✅ Deployment Checklist

- [ ] Docker and Docker Compose installed
- [ ] `.env` file configured (if needed)
- [ ] Custom JWT_SECRET set
- [ ] `docker-compose up -d` runs successfully
- [ ] API accessible at http://localhost:3000
- [ ] Health check returns 200 OK
- [ ] Database migrations ran successfully
- [ ] Can create user and login
- [ ] Logs are working (`docker-compose logs`)

---

**Status**: ✅ Production-Ready Docker Setup  
**Last Updated**: February 5, 2026

---

## 🎉 Quick Command Reference

```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Reset
docker-compose down -v && docker-compose up -d --build

# Test
curl http://localhost:3000/health
```

**Your entire system runs with one command!** 🐳
