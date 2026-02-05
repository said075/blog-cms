# 🗄️ Database Workflow & Management Guide

## 📚 Table of Contents
1. [Database Connection](#database-connection)
2. [Running Migrations](#running-migrations)
3. [Using Prisma Client](#using-prisma-client)
4. [Common Workflows](#common-workflows)
5. [Best Practices](#best-practices)

---

## 🔌 Database Connection

### How It Works

```
Your App → Prisma Client → PostgreSQL (Docker)
          └─ Type-safe API
```

### Connection Flow

1. **Environment Variable** (`.env`)
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5433/blog_cms?schema=public"
   ```

2. **Prisma Config** (`prisma.config.ts`)
   - Reads `DATABASE_URL` from environment
   - Configures connection for migrations

3. **Prisma Client** (`src/config/database.ts`)
   - Singleton instance
   - Lazy connection (connects on first query)
   - Auto-reconnects if connection drops

### Import Database Client

```typescript
// In any file that needs database access
import prisma from './config/database';

// Now you can use prisma to query the database
const users = await prisma.user.findMany();
```

---

## 🚀 Running Migrations

### What are Migrations?

Migrations are **version-controlled database changes**. They track every change to your schema over time.

### Migration Workflow

```bash
# 1. Make changes to prisma/schema.prisma
# 2. Generate migration
npm run db:migrate

# Prisma will:
# ✓ Compare schema with database
# ✓ Generate SQL migration file
# ✓ Apply migration to database
# ✓ Update Prisma Client
```

### Migration Commands

```bash
# Create and apply migration (development)
npm run db:migrate
# → Creates: prisma/migrations/20240101_migration_name/

# Generate Prisma Client only (after schema changes)
npm run db:generate

# Apply existing migrations (production)
npx prisma migrate deploy

# Reset database (⚠️ DELETES ALL DATA)
npm run db:reset

# Check migration status
npx prisma migrate status
```

### When to Run Migrations

✅ **After changing** `prisma/schema.prisma`:
- Adding new models
- Adding/removing fields
- Changing field types
- Adding relations

✅ **Before deploying** to production

✅ **After pulling** schema changes from Git

---

## 💻 Using Prisma Client

### Basic CRUD Operations

#### CREATE
```typescript
import prisma from './config/database';

// Create single record
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    username: 'johndoe',
    password: 'hashed_password',
    firstName: 'John',
    lastName: 'Doe',
    role: 'AUTHOR'
  }
});

// Create with relations
const post = await prisma.post.create({
  data: {
    title: 'My First Post',
    slug: 'my-first-post',
    content: 'Post content here...',
    status: 'PUBLISHED',
    authorId: user.id,
    tags: ['typescript', 'nodejs']
  }
});

// Create many
const users = await prisma.user.createMany({
  data: [
    { email: 'user1@example.com', username: 'user1', ... },
    { email: 'user2@example.com', username: 'user2', ... }
  ]
});
```

#### READ
```typescript
// Find unique (by unique field)
const user = await prisma.user.findUnique({
  where: { email: 'john@example.com' }
});

// Find first match
const post = await prisma.post.findFirst({
  where: { status: 'PUBLISHED' }
});

// Find many with filters
const posts = await prisma.post.findMany({
  where: {
    status: 'PUBLISHED',
    tags: { has: 'typescript' }
  },
  orderBy: { createdAt: 'desc' },
  take: 10,  // Limit
  skip: 0    // Offset for pagination
});

// Find with relations
const postWithAuthor = await prisma.post.findUnique({
  where: { id: 'post-id' },
  include: {
    author: true,
    comments: true,
    category: true
  }
});

// Select specific fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    username: true,
    email: true
    // password NOT included (security!)
  }
});

// Count records
const userCount = await prisma.user.count();
const publishedCount = await prisma.post.count({
  where: { status: 'PUBLISHED' }
});
```

#### UPDATE
```typescript
// Update single record
const updatedUser = await prisma.user.update({
  where: { id: 'user-id' },
  data: {
    firstName: 'Jane',
    bio: 'Updated bio'
  }
});

// Update many records
const result = await prisma.post.updateMany({
  where: { status: 'DRAFT' },
  data: { status: 'ARCHIVED' }
});

// Increment/Decrement
const post = await prisma.post.update({
  where: { id: 'post-id' },
  data: {
    viewCount: { increment: 1 }
  }
});

// Upsert (update or create)
const user = await prisma.user.upsert({
  where: { email: 'john@example.com' },
  update: { lastLogin: new Date() },
  create: {
    email: 'john@example.com',
    username: 'johndoe',
    ...
  }
});
```

#### DELETE
```typescript
// Delete single record
await prisma.user.delete({
  where: { id: 'user-id' }
});

// Delete many records
await prisma.post.deleteMany({
  where: { status: 'DRAFT' }
});

// Delete all (⚠️ DANGEROUS)
await prisma.user.deleteMany();
```

### Advanced Queries

#### Nested Writes
```typescript
// Create post with comments in one query
const post = await prisma.post.create({
  data: {
    title: 'Post with Comments',
    slug: 'post-with-comments',
    content: 'Content...',
    authorId: userId,
    comments: {
      create: [
        {
          content: 'First comment',
          authorId: userId,
          status: 'APPROVED'
        }
      ]
    }
  }
});
```

#### Filtering
```typescript
// Complex where conditions
const posts = await prisma.post.findMany({
  where: {
    AND: [
      { status: 'PUBLISHED' },
      {
        OR: [
          { title: { contains: 'typescript' } },
          { tags: { has: 'typescript' } }
        ]
      }
    ],
    authorId: { not: null },
    publishedAt: {
      gte: new Date('2024-01-01')
    }
  }
});
```

#### Transactions
```typescript
// Multiple operations - all or nothing
const result = await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.post.create({ data: postData }),
  prisma.comment.create({ data: commentData })
]);

// Interactive transactions
const result = await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  const post = await tx.post.create({
    data: { ...postData, authorId: user.id }
  });
  return { user, post };
});
```

#### Aggregations
```typescript
// Count, sum, avg, min, max
const stats = await prisma.post.aggregate({
  _count: true,
  _avg: { viewCount: true },
  _sum: { viewCount: true },
  _max: { viewCount: true },
  where: { status: 'PUBLISHED' }
});

// Group by
const postsByAuthor = await prisma.post.groupBy({
  by: ['authorId'],
  _count: true,
  where: { status: 'PUBLISHED' }
});
```

---

## 🔄 Common Workflows

### 1. Adding a New Model

```bash
# 1. Edit prisma/schema.prisma
# Add your new model:

model Tag {
  id        String   @id @default(uuid())
  name      String   @unique
  slug      String   @unique
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@map("tags")
}

# 2. Create and apply migration
npm run db:migrate
# Name it: "add_tag_model"

# 3. Prisma Client is now updated!
```

### 2. Changing an Existing Field

```bash
# 1. Edit field in schema.prisma
# Before: email String
# After:  email String @db.VarChar(100)

# 2. Generate migration
npm run db:migrate
# Name it: "add_email_length_constraint"

# 3. Migration applied!
```

### 3. Development Workflow

```bash
# Daily workflow:

# 1. Pull latest code
git pull

# 2. Install dependencies (if package.json changed)
npm install

# 3. Start database
npm run docker:up

# 4. Apply new migrations (if any)
npm run db:migrate

# 5. Start dev server
npm run dev

# 6. View database
npm run db:studio
```

### 4. Seeding the Database

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      password: 'hashed_password',
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN'
    }
  });

  console.log('✅ Seeded:', admin);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Run with:
```bash
npx prisma db seed
```

---

## ✅ Best Practices

### 1. Connection Management

```typescript
// ✅ GOOD: Use singleton (src/config/database.ts)
import prisma from './config/database';

// ❌ BAD: Creating new instances
const prisma = new PrismaClient(); // Don't do this!
```

### 2. Error Handling

```typescript
import { Prisma } from '@prisma/client';

try {
  const user = await prisma.user.create({ data: userData });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      // Unique constraint violation
      throw new Error('Email already exists');
    }
  }
  throw error;
}
```

### 3. Security

```typescript
// ✅ GOOD: Exclude sensitive fields
const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    username: true,
    email: true
    // password NOT included
  }
});

// ❌ BAD: Returning password
const user = await prisma.user.findUnique({ where: { id } });
return user; // Contains password hash!
```

### 4. Performance

```typescript
// ✅ GOOD: Batch operations
await prisma.user.createMany({
  data: users // Array of users
});

// ❌ BAD: Loop with await
for (const user of users) {
  await prisma.user.create({ data: user }); // Slow!
}

// ✅ GOOD: Select only needed fields
const users = await prisma.user.findMany({
  select: { id: true, username: true }
});

// ❌ BAD: Fetching everything
const users = await prisma.user.findMany(); // Gets all fields
```

### 5. Migrations

```bash
# ✅ GOOD: Descriptive migration names
npm run db:migrate
# Name: "add_user_avatar_field"

# ❌ BAD: Generic names
# Name: "migration1"

# ✅ GOOD: Small, focused migrations
# Add one feature per migration

# ❌ BAD: Huge migrations with many changes
# Makes debugging harder
```

---

## 🛠️ Troubleshooting

### "Can't reach database server"
```bash
# Check if Docker container is running
docker ps | grep blog-cms-postgres

# Restart container
npm run docker:restart

# Check connection string in .env
cat .env | grep DATABASE_URL
```

### "Migration already exists"
```bash
# Mark migration as applied without running
npx prisma migrate resolve --applied "migration_name"
```

### "Out of sync" errors
```bash
# Reset database (⚠️ deletes data)
npm run db:reset

# Or just generate client
npm run db:generate
```

### Check Prisma version
```bash
npx prisma --version

# Update if needed
npm install prisma@latest @prisma/client@latest
```

---

## 📚 Useful Commands Summary

```bash
# Docker
npm run docker:up        # Start PostgreSQL
npm run docker:down      # Stop PostgreSQL
npm run docker:logs      # View logs

# Migrations
npm run db:migrate       # Create & apply migration
npm run db:generate      # Generate Prisma Client
npm run db:reset         # Reset database

# Development
npm run db:studio        # Open DB browser
npm run db:test          # Run test script

# Prisma CLI
npx prisma format        # Format schema.prisma
npx prisma validate      # Validate schema
npx prisma migrate status # Check migration status
npx prisma db push       # Push schema without migration (dev only)
```

---

## 🎓 Learning Resources

- **Prisma Docs**: https://www.prisma.io/docs
- **Prisma Client API**: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **SQL Tutorial**: https://www.postgresqltutorial.com/

---

## 🚀 Next Steps

Now that you understand database management, you can:
1. ✅ Create services that use Prisma Client
2. ✅ Build API endpoints for CRUD operations
3. ✅ Implement authentication with database
4. ✅ Add validation and error handling
5. ✅ Deploy to production

Ready to build your API! 🎉
