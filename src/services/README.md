# Services Layer

## What are Services?

Services contain the **business logic** and **database operations** of your application. They sit between controllers (which handle HTTP requests) and the database.

```
HTTP Request → Controller → Service → Database
                    ↓           ↓
              Validation   Business Logic
              Error Handling
```

## Why Use Services?

✅ **Separation of Concerns** - Keep business logic separate from HTTP handling  
✅ **Reusability** - Use the same service in multiple controllers  
✅ **Testability** - Easy to unit test business logic  
✅ **Maintainability** - Changes in one place  

## Service Structure

Each service is a **class** with methods for database operations:

```typescript
class UserService {
  async createUser(data) { /* ... */ }
  async findById(id) { /* ... */ }
  async updateUser(id, data) { /* ... */ }
  async deleteUser(id) { /* ... */ }
}

export default new UserService();
```

## How to Use Services

### In Controllers

```typescript
import userService from '../services/user.service';

export const getUser = async (req, res) => {
  const user = await userService.findById(req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ success: true, data: user });
};
```

### In Other Services

```typescript
import userService from './user.service';

export class PostService {
  async createPost(data) {
    // Verify author exists
    const author = await userService.findById(data.authorId);
    if (!author) throw new Error('Author not found');
    
    // Create post...
  }
}
```

## Available Services

### 1. UserService (`user.service.ts`)

```typescript
// Create user
const result = await userService.createUser({
  email: 'john@example.com',
  username: 'johndoe',
  password: 'hashed_password',
  firstName: 'John',
  lastName: 'Doe'
});

// Find by email
const user = await userService.findByEmail('john@example.com');

// Find by ID
const user = await userService.findById('user-id');

// Get all users (with pagination)
const result = await userService.getAllUsers({
  page: 1,
  limit: 10,
  role: 'AUTHOR'
});

// Update user
const result = await userService.updateUser('user-id', {
  firstName: 'Jane',
  bio: 'Updated bio'
});

// Delete user
const result = await userService.deleteUser('user-id');

// Get statistics
const stats = await userService.getUserStats();
```

### 2. PostService (`post.service.ts`)

```typescript
// Create post
const post = await postService.createPost({
  title: 'My Post',
  slug: 'my-post',
  content: 'Post content...',
  authorId: 'user-id',
  tags: ['typescript', 'nodejs'],
  status: 'PUBLISHED'
});

// Get by ID
const post = await postService.getPostById('post-id');

// Get by slug
const post = await postService.getPostBySlug('my-post-slug');

// Get all posts (with filters)
const result = await postService.getAllPosts({
  page: 1,
  limit: 10,
  status: 'PUBLISHED',
  tags: ['typescript'],
  search: 'database'
});

// Update post
const result = await postService.updatePost('post-id', 'author-id', {
  title: 'Updated Title'
});

// Delete post
const result = await postService.deletePost('post-id', 'author-id');

// Get statistics
const stats = await postService.getPostStats('author-id');
```

## Creating New Services

### 1. Create Service File

```typescript
// src/services/comment.service.ts
import prisma from '../config/database';

export class CommentService {
  async createComment(data) {
    return await prisma.comment.create({ data });
  }
  
  // ... other methods
}

export default new CommentService();
```

### 2. Add Error Handling

```typescript
import { Prisma } from '@prisma/client';

async createComment(data) {
  try {
    return await prisma.comment.create({ data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific errors
      if (error.code === 'P2003') {
        throw new Error('Post or user not found');
      }
    }
    throw error;
  }
}
```

### 3. Add Return Types

```typescript
interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async createComment(data): Promise<ServiceResult<Comment>> {
  try {
    const comment = await prisma.comment.create({ data });
    return { success: true, data: comment };
  } catch (error) {
    return { success: false, error: 'Failed to create comment' };
  }
}
```

## Best Practices

### 1. Keep Services Focused
```typescript
// ✅ GOOD: One service per model
class UserService { }
class PostService { }
class CommentService { }

// ❌ BAD: One service for everything
class DatabaseService { }
```

### 2. Use Transactions for Related Operations
```typescript
async createPostWithCategory(postData, categoryData) {
  return await prisma.$transaction(async (tx) => {
    const category = await tx.category.create({ data: categoryData });
    const post = await tx.post.create({
      data: { ...postData, categoryId: category.id }
    });
    return { post, category };
  });
}
```

### 3. Validate Before Database Operations
```typescript
async updateUser(id, data) {
  // Validate first
  if (data.email && !isValidEmail(data.email)) {
    return { success: false, error: 'Invalid email' };
  }
  
  // Then update
  const user = await prisma.user.update({ where: { id }, data });
  return { success: true, data: user };
}
```

### 4. Don't Return Sensitive Data
```typescript
// ✅ GOOD: Exclude password
select: {
  id: true,
  email: true,
  username: true
  // password NOT included
}

// ❌ BAD: Include everything
const user = await prisma.user.findUnique({ where: { id } });
return user; // Contains password!
```

### 5. Use Consistent Return Types
```typescript
// ✅ GOOD: Consistent structure
return { success: true, data: user };
return { success: false, error: 'Not found' };

// ❌ BAD: Inconsistent returns
return user;
throw new Error('Not found');
```

## Testing Services

```typescript
// Example test
describe('UserService', () => {
  it('should create a user', async () => {
    const result = await userService.createUser({
      email: 'test@example.com',
      username: 'testuser',
      // ...
    });
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('id');
  });
});
```

## Next Steps

1. ✅ Create controllers that use these services
2. ✅ Add validation middleware
3. ✅ Implement authentication
4. ✅ Create API routes
5. ✅ Add error handling middleware
