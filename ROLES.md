# Blog CMS - Role-Based Access Control (RBAC)

## Overview
The Blog CMS uses a three-tier role system for access control.

---

## 👑 ADMIN

**Full system access and control**

### Permissions:
✅ **User Management**
- Create, read, update, delete any user
- Change user roles
- Suspend/ban users
- View all user activity

✅ **Post Management**
- Create, read, update, delete ANY post (including others' posts)
- Change post status (draft, published, archived, scheduled)
- Manage categories and tags
- View post analytics

✅ **Comment Management**
- Moderate ALL comments
- Approve, reject, or mark as spam
- Delete any comment
- View pending comments

✅ **System Settings**
- Configure system settings
- Manage categories
- Access analytics and reports
- Export data

### Use Cases:
- System administrators
- Content managers
- Site owners

---

## ✍️ AUTHOR

**Content creation and management of own content**

### Permissions:
✅ **Own Posts**
- Create new posts
- Read, update, delete OWN posts only
- Change status of OWN posts (draft → published)
- Add tags and categories to own posts
- Upload featured images

✅ **Profile Management**
- Update own profile
- Change own password
- Update avatar and bio

✅ **Comments**
- Reply to comments on own posts
- View comments on own posts
- Cannot moderate (only report)

❌ **Restrictions:**
- Cannot edit/delete other authors' posts
- Cannot access user management
- Cannot change system settings
- Cannot moderate comments (except on own posts)

### Use Cases:
- Blog writers
- Content creators
- Contributing authors

---

## 👁️ READER

**Read and interact with published content**

### Permissions:
✅ **Reading**
- View published posts
- View public user profiles
- Browse categories and tags
- Search posts

✅ **Engagement**
- Post comments on published posts
- Reply to other comments
- Edit/delete OWN comments only
- Like posts (if feature implemented)

✅ **Profile**
- Update own profile
- Change own password
- Update avatar and bio

❌ **Restrictions:**
- Cannot create posts
- Cannot edit any posts
- Cannot moderate comments
- Cannot access admin features
- Cannot view drafts or unpublished content

### Use Cases:
- Regular users
- Blog readers
- Community members

---

## 🔐 Permission Matrix

| Action | ADMIN | AUTHOR | READER |
|--------|-------|--------|--------|
| **Users** |
| View all users | ✅ | ❌ | ❌ |
| Create users | ✅ | ❌ | ❌ |
| Update any user | ✅ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ |
| Change user roles | ✅ | ❌ | ❌ |
| Update own profile | ✅ | ✅ | ✅ |
| **Posts** |
| View published posts | ✅ | ✅ | ✅ |
| View all drafts | ✅ | ❌ | ❌ |
| View own drafts | ✅ | ✅ | ❌ |
| Create posts | ✅ | ✅ | ❌ |
| Update any post | ✅ | ❌ | ❌ |
| Update own posts | ✅ | ✅ | ❌ |
| Delete any post | ✅ | ❌ | ❌ |
| Delete own posts | ✅ | ✅ | ❌ |
| Publish posts | ✅ | ✅ | ❌ |
| **Comments** |
| View comments | ✅ | ✅ | ✅ |
| Post comments | ✅ | ✅ | ✅ |
| Edit own comments | ✅ | ✅ | ✅ |
| Delete own comments | ✅ | ✅ | ✅ |
| Moderate any comment | ✅ | ❌ | ❌ |
| Delete any comment | ✅ | ❌ | ❌ |
| **Categories** |
| View categories | ✅ | ✅ | ✅ |
| Create categories | ✅ | ❌ | ❌ |
| Update categories | ✅ | ❌ | ❌ |
| Delete categories | ✅ | ❌ | ❌ |
| **System** |
| View analytics | ✅ | ⚠️ Own only | ❌ |
| System settings | ✅ | ❌ | ❌ |
| Export data | ✅ | ❌ | ❌ |

*⚠️ = Limited access*

---

## 🔧 Implementation Notes

### Default Role
- New users are assigned **READER** role by default
- Only ADMIN can promote users to AUTHOR or ADMIN

### Role Hierarchy
```
ADMIN (highest privileges)
  ↓
AUTHOR (content creation)
  ↓
READER (read-only + comments)
```

### Security Considerations
1. **Always verify user role** on protected routes
2. **Check ownership** for AUTHOR actions (can only modify own content)
3. **Validate permissions** on both frontend and backend
4. **Log role changes** for audit trail
5. **Require re-authentication** for role changes

### Middleware Implementation
```typescript
// Example middleware structure
- requireAuth(): Check if user is authenticated
- requireRole(['admin']): Restrict to specific roles
- requireAuthorOrAdmin(): Allow AUTHOR for own content, ADMIN for all
- requireOwnership(): Verify user owns the resource
```

---

## 📊 Role Assignment Strategy

### When to assign ADMIN:
- System administrators
- Site owners
- Trusted moderators
- ⚠️ Use sparingly - high security risk

### When to assign AUTHOR:
- Trusted content creators
- Staff writers
- Guest bloggers
- Contributors who passed vetting

### When to assign READER:
- All new registrations (default)
- Community members
- Commenters
- General public users

---

## 🚀 Future Enhancements

Potential role system improvements:
- [ ] Custom permissions per role
- [ ] Role-based content visibility
- [ ] Time-limited role assignments
- [ ] Role approval workflow
- [ ] Multi-role support (user can have multiple roles)
- [ ] Resource-specific permissions
