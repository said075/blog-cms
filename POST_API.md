# 📝 Post API Documentation

Complete guide for the Blog Post CRUD API endpoints.

---

## 🎯 Quick Reference

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/posts` | AUTHOR/ADMIN | Create post |
| GET | `/api/posts` | Public | List all posts |
| GET | `/api/posts/:id` | Public* | Get post by ID |
| GET | `/api/posts/slug/:slug` | Public* | Get post by slug |
| GET | `/api/posts/my/posts` | Private | Get own posts |
| GET | `/api/posts/stats` | Private | Get statistics |
| PUT | `/api/posts/:id` | Owner/ADMIN | Update post |
| DELETE | `/api/posts/:id` | Owner/ADMIN | Delete post |

*Drafts require authentication and ownership

---

## 📚 Endpoints

### 1. Create Post

Create a new blog post.

**POST** `/api/posts`

**Authorization:** Required (AUTHOR or ADMIN role)

**Request Body:**
```json
{
  "title": "Getting Started with Node.js",
  "content": "Node.js is a JavaScript runtime...",
  "excerpt": "Learn Node.js basics",
  "featuredImage": "https://example.com/image.jpg",
  "tags": ["nodejs", "javascript", "backend"],
  "categoryId": "category-uuid",
  "status": "PUBLISHED"
}
```

**Fields:**
- `title` (required): Post title
- `content` (required): Post content (Markdown or HTML)
- `excerpt` (optional): Short summary
- `featuredImage` (optional): Image URL
- `tags` (optional): Array of tags
- `categoryId` (optional): Category UUID
- `status` (optional): `DRAFT` | `PUBLISHED` | `ARCHIVED` | `SCHEDULED` (default: `DRAFT`)
- `publishedAt` (optional): Publication date (auto-set for PUBLISHED)

**Response (201):**
```json
{
  "success": true,
  "message": "Post created successfully",
  "data": {
    "id": "uuid",
    "title": "Getting Started with Node.js",
    "slug": "getting-started-with-nodejs",
    "content": "...",
    "excerpt": "Learn Node.js basics",
    "featuredImage": "https://example.com/image.jpg",
    "authorId": "author-uuid",
    "status": "PUBLISHED",
    "tags": ["nodejs", "javascript", "backend"],
    "categoryId": "category-uuid",
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "viewCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "category": {
      "id": "uuid",
      "name": "Technology",
      "slug": "technology"
    }
  }
}
```

**Note:** Slug is auto-generated from title if not provided.

---

### 2. Get All Posts

List all posts with filtering, searching, and pagination.

**GET** `/api/posts`

**Authorization:** Optional (authenticated users see more)

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (PUBLISHED, DRAFT, etc.)
- `authorId` (string): Filter by author
- `categoryId` (string): Filter by category
- `tags` (string): Comma-separated tags (e.g., `nodejs,javascript`)
- `search` (string): Search in title and content
- `sortBy` (string): `createdAt` | `publishedAt` | `viewCount` | `title`
- `sortOrder` (string): `asc` | `desc` (default: `desc`)

**Examples:**
```bash
# Get all published posts
GET /api/posts

# Search posts
GET /api/posts?search=nodejs

# Filter by tags
GET /api/posts?tags=javascript,typescript

# Pagination
GET /api/posts?page=2&limit=20

# Sort by most viewed
GET /api/posts?sortBy=viewCount&sortOrder=desc
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Getting Started with Node.js",
      "slug": "getting-started-with-nodejs",
      "excerpt": "Learn Node.js basics",
      "featuredImage": "https://example.com/image.jpg",
      "status": "PUBLISHED",
      "tags": ["nodejs", "javascript"],
      "viewCount": 150,
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "uuid",
        "username": "johndoe",
        "firstName": "John",
        "lastName": "Doe"
      },
      "category": {
        "id": "uuid",
        "name": "Technology"
      },
      "_count": {
        "comments": 5
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### 3. Get Post by ID

Get a single post by its ID.

**GET** `/api/posts/:id`

**Authorization:** Optional (required for unpublished posts)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Getting Started with Node.js",
    "slug": "getting-started-with-nodejs",
    "content": "Full post content here...",
    "excerpt": "Learn Node.js basics",
    "featuredImage": "https://example.com/image.jpg",
    "status": "PUBLISHED",
    "tags": ["nodejs", "javascript"],
    "viewCount": 151,
    "publishedAt": "2024-01-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg",
      "bio": "Full-stack developer"
    },
    "category": {
      "id": "uuid",
      "name": "Technology",
      "slug": "technology"
    },
    "comments": [
      {
        "id": "uuid",
        "content": "Great article!",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "author": {
          "username": "jane",
          "firstName": "Jane",
          "lastName": "Smith"
        }
      }
    ]
  }
}
```

**Note:** View count increments automatically on each view.

---

### 4. Get Post by Slug

Get a post by its URL-friendly slug.

**GET** `/api/posts/slug/:slug`

**Authorization:** Optional

**Example:**
```bash
GET /api/posts/slug/getting-started-with-nodejs
```

**Response:** Same as Get Post by ID

---

### 5. Get My Posts

Get all posts created by the authenticated user.

**GET** `/api/posts/my/posts`

**Authorization:** Required

**Query Parameters:**
- `page`, `limit`, `status`, `sortBy`, `sortOrder` (same as Get All Posts)

**Response (200):**
```json
{
  "success": true,
  "data": [/* array of posts */],
  "pagination": {/* pagination info */}
}
```

---

### 6. Get Post Statistics

Get statistics about posts.

**GET** `/api/posts/stats`

**Authorization:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 25,
    "published": 20,
    "draft": 5,
    "byStatus": [
      { "status": "PUBLISHED", "_count": 20 },
      { "status": "DRAFT", "_count": 5 }
    ],
    "totalViews": 1500
  }
}
```

**Note:** Regular users see their own stats, ADMIN sees all stats.

---

### 7. Update Post

Update a post you own (or any post if ADMIN).

**PUT** `/api/posts/:id`

**Authorization:** Required (Owner or ADMIN)

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "status": "PUBLISHED",
  "tags": ["nodejs", "express", "tutorial"]
}
```

**Fields:** All optional, only include fields you want to update

**Response (200):**
```json
{
  "success": true,
  "message": "Post updated successfully",
  "data": {/* updated post object */}
}
```

---

### 8. Delete Post

Delete a post you own (or any post if ADMIN).

**DELETE** `/api/posts/:id`

**Authorization:** Required (Owner or ADMIN)

**Response (200):**
```json
{
  "success": true,
  "message": "Post deleted successfully"
}
```

---

## 🔒 Authorization Rules

### Create Post
- ✅ AUTHOR role
- ✅ ADMIN role
- ❌ READER role (403 Forbidden)

### Read Posts
- ✅ Anyone can read PUBLISHED posts
- ✅ Author can read own DRAFT posts
- ✅ ADMIN can read all posts
- ❌ Others cannot read DRAFT posts

### Update Post
- ✅ Post owner (author)
- ✅ ADMIN role
- ❌ Other users (403 Forbidden)

### Delete Post
- ✅ Post owner (author)
- ✅ ADMIN role
- ❌ Other users (403 Forbidden)

---

## 🧪 Testing

### Test with cURL

**1. Create a post (requires AUTHOR token):**
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTHOR_TOKEN" \
  -d '{
    "title": "My First Post",
    "content": "This is my first blog post!",
    "tags": ["firstpost", "blog"],
    "status": "PUBLISHED"
  }'
```

**2. Get all posts:**
```bash
curl http://localhost:3000/api/posts
```

**3. Search posts:**
```bash
curl "http://localhost:3000/api/posts?search=node&tags=javascript"
```

**4. Update post:**
```bash
curl -X PUT http://localhost:3000/api/posts/POST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Updated Title"
  }'
```

**5. Delete post:**
```bash
curl -X DELETE http://localhost:3000/api/posts/POST_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Automated Tests

Run the complete test suite:

```bash
# Make sure server is running
npm run dev

# In another terminal
npm run test:posts
```

---

## 📊 Post Status Workflow

```
DRAFT → PUBLISHED → ARCHIVED
  ↓         ↓
  ↓    SCHEDULED
  ↓         ↓
  └────→ PUBLISHED
```

**Status Meanings:**
- **DRAFT** - Unpublished, only visible to author/admin
- **PUBLISHED** - Live and visible to everyone
- **ARCHIVED** - No longer active, hidden from public
- **SCHEDULED** - Will be published at a future date

---

## 🎨 Slug Generation

Slugs are automatically generated from the title:

```
"Getting Started with Node.js" → "getting-started-with-nodejs"
"TypeScript & Express.js" → "typescript-and-expressjs"
"Hello World!!!" → "hello-world"
```

If a slug already exists, a number is appended:
```
"hello-world" → "hello-world-2" → "hello-world-3"
```

---

## 🔍 Search & Filtering

### Search
Searches in both title and content (case-insensitive):
```bash
GET /api/posts?search=typescript
```

### Filter by Tags
Comma-separated list of tags (posts must have ALL tags):
```bash
GET /api/posts?tags=nodejs,express
```

### Filter by Author
```bash
GET /api/posts?authorId=uuid
```

### Filter by Category
```bash
GET /api/posts?categoryId=uuid
```

### Combined Filters
```bash
GET /api/posts?status=PUBLISHED&tags=nodejs&sortBy=viewCount
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Title and content are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You do not have permission to perform this action",
  "requiredRoles": ["ADMIN", "AUTHOR"],
  "yourRole": "READER"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Post not found"
}
```

---

## 💡 Tips & Best Practices

### 1. Use Slugs for URLs
Use slugs instead of IDs for SEO-friendly URLs:
```
✅ /blog/getting-started-with-nodejs
❌ /blog/uuid-here
```

### 2. Set Excerpt for List Views
Always provide an excerpt for better list displays and SEO.

### 3. Use Tags for Organization
Tag posts consistently for better discovery:
```json
{
  "tags": ["nodejs", "tutorial", "beginner"]
}
```

### 4. Draft → Published Workflow
1. Create post as DRAFT
2. Review and edit
3. Set status to PUBLISHED when ready

### 5. Pagination for Performance
Always use pagination for list endpoints:
```bash
GET /api/posts?page=1&limit=20
```

---

## 🚀 Quick Start Examples

### Create Your First Post

```javascript
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'My First Blog Post',
    content: 'Welcome to my blog!',
    excerpt: 'My first post',
    tags: ['intro', 'firstpost'],
    status: 'PUBLISHED'
  })
});

const data = await response.json();
console.log('Post created:', data.data.slug);
```

### Get and Display Posts

```javascript
const response = await fetch('/api/posts?page=1&limit=10');
const { data, pagination } = await response.json();

data.forEach(post => {
  console.log(`${post.title} by ${post.author.username}`);
  console.log(`Views: ${post.viewCount}`);
});
```

---

## 📚 Related Documentation

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Authentication guide
- [ROLES.md](./ROLES.md) - Role-based access control
- [DATABASE_WORKFLOW.md](./DATABASE_WORKFLOW.md) - Database operations

---

## ✅ Feature Checklist

- [x] Create posts (AUTHOR/ADMIN only)
- [x] List all posts with pagination
- [x] Get single post by ID
- [x] Get post by slug
- [x] Update posts (owner/ADMIN only)
- [x] Delete posts (owner/ADMIN only)
- [x] Get user's own posts
- [x] Post statistics
- [x] Search posts
- [x] Filter by tags
- [x] Filter by author
- [x] Filter by category
- [x] Sort posts
- [x] Auto-generate slugs
- [x] View count tracking
- [x] Draft/Published workflow
- [x] Role-based authorization

🎉 **Post CRUD system complete!**
