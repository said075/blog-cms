# Blog CMS - Entity Design

## Overview
This document describes the data entities for the Blog CMS system.

---

## 🧑‍💼 User Entity

### Fields:
- **id**: `string` - Unique identifier (UUID)
- **email**: `string` - User email (unique, required)
- **username**: `string` - Username (unique, required)
- **password**: `string` - Hashed password
- **firstName**: `string` - First name
- **lastName**: `string` - Last name
- **role**: `UserRole` - User role (admin, editor, author, user)
- **avatar**: `string?` - Profile image URL (optional)
- **bio**: `string?` - User biography (optional)
- **status**: `AccountStatus` - Account status (active, inactive, suspended, banned)
- **emailVerified**: `boolean` - Email verification status
- **lastLogin**: `Date?` - Last login timestamp
- **createdAt**: `Date` - Account creation timestamp
- **updatedAt**: `Date` - Last update timestamp

### Relationships:
- **One-to-Many**: User → Posts (author)
- **One-to-Many**: User → Comments (author)

---

## 📝 Post Entity

### Fields:
- **id**: `string` - Unique identifier (UUID)
- **title**: `string` - Post title (required)
- **slug**: `string` - URL-friendly slug (unique)
- **content**: `string` - Post content (Markdown or HTML)
- **excerpt**: `string?` - Short summary (optional)
- **featuredImage**: `string?` - Featured image URL (optional)
- **authorId**: `string` - Reference to User (foreign key)
- **status**: `PostStatus` - Post status (draft, published, archived, scheduled)
- **tags**: `string[]` - Array of tags
- **categoryId**: `string?` - Reference to Category (foreign key, optional)
- **publishedAt**: `Date?` - Publication timestamp
- **viewCount**: `number` - Number of views (default: 0)
- **createdAt**: `Date` - Creation timestamp
- **updatedAt**: `Date` - Last update timestamp

### Relationships:
- **Many-to-One**: Post → User (author)
- **Many-to-One**: Post → Category
- **One-to-Many**: Post → Comments

---

## 💬 Comment Entity

### Fields:
- **id**: `string` - Unique identifier (UUID)
- **content**: `string` - Comment content (required)
- **postId**: `string` - Reference to Post (foreign key)
- **authorId**: `string` - Reference to User (foreign key)
- **parentId**: `string?` - Reference to parent Comment for nested replies (optional)
- **status**: `CommentStatus` - Comment status (pending, approved, rejected, spam)
- **createdAt**: `Date` - Creation timestamp
- **updatedAt**: `Date` - Last update timestamp

### Relationships:
- **Many-to-One**: Comment → Post
- **Many-to-One**: Comment → User (author)
- **Many-to-One**: Comment → Comment (parent, self-referential)
- **One-to-Many**: Comment → Comments (replies)

---

## 🗂️ Category Entity (Bonus)

### Fields:
- **id**: `string` - Unique identifier (UUID)
- **name**: `string` - Category name (required)
- **slug**: `string` - URL-friendly slug (unique)
- **description**: `string?` - Category description (optional)
- **parentId**: `string?` - Reference to parent Category for nested structure (optional)
- **createdAt**: `Date` - Creation timestamp
- **updatedAt**: `Date` - Last update timestamp

### Relationships:
- **One-to-Many**: Category → Posts
- **Many-to-One**: Category → Category (parent, self-referential)
- **One-to-Many**: Category → Categories (children)

---

## 📊 Entity Relationship Diagram (ERD)

```
┌─────────────┐
│    User     │
├─────────────┤
│ id          │
│ email       │◄─────────┐
│ username    │          │
│ password    │          │
│ firstName   │          │
│ lastName    │          │
│ role        │          │ authorId
│ ...         │          │
└─────────────┘          │
       ▲                 │
       │                 │
       │ authorId   ┌────┴──────┐
       │            │   Post    │
       │            ├───────────┤
       │            │ id        │
       │            │ title     │
       │            │ slug      │
       │            │ content   │
       │            │ authorId  │
       │            │ categoryId│──┐
       └────────────│ ...       │  │
                    └───────────┘  │
                         ▲         │
                         │         │
                         │ postId  │
                         │         │
                    ┌────┴──────┐  │     ┌──────────┐
                    │  Comment  │  └────►│ Category │
                    ├───────────┤        ├──────────┤
                    │ id        │        │ id       │
                    │ content   │        │ name     │
                    │ postId    │        │ slug     │
                    │ authorId  ├───┐    │ ...      │
                    │ parentId  │   │    └──────────┘
                    │ ...       │   │
                    └───────────┘   │
                         ▲          │
                         │          │
                         └──────────┘
                           (self-referential
                            for replies)
```

---

## 🔐 Enums

### UserRole
- `ADMIN` - Full system access and user management
- `AUTHOR` - Can create and manage own posts
- `READER` - Can read posts and comment only

### PostStatus
- `DRAFT` - Unpublished draft
- `PUBLISHED` - Published and visible
- `ARCHIVED` - Archived/hidden
- `SCHEDULED` - Scheduled for future publication

### CommentStatus
- `PENDING` - Awaiting moderation
- `APPROVED` - Approved and visible
- `REJECTED` - Rejected by moderator
- `SPAM` - Marked as spam

### AccountStatus
- `ACTIVE` - Active account
- `INACTIVE` - Inactive account
- `SUSPENDED` - Temporarily suspended
- `BANNED` - Permanently banned

---

## 💡 Design Notes

1. **UUID for IDs**: Using string UUIDs for better scalability and security
2. **Soft Deletes**: Consider adding `deletedAt` field for soft deletes
3. **Timestamps**: All entities have `createdAt` and `updatedAt`
4. **Slugs**: Auto-generated from titles for SEO-friendly URLs
5. **Nested Comments**: `parentId` allows threaded discussions
6. **Tags**: Array of strings for flexibility (can be normalized later)
7. **Status Fields**: Allow content moderation and workflow management
8. **View Count**: Track post popularity
9. **Email Verification**: Support for email verification flow
10. **Role-Based Access**: Three-tier permission system (Admin, Author, Reader)
