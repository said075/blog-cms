/**
 * User Roles
 */
export enum UserRole {
  ADMIN = 'admin',
  AUTHOR = 'author',
  READER = 'reader'
}

/**
 * Post Status
 */
export enum PostStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
  SCHEDULED = 'scheduled'
}

/**
 * Comment Status
 */
export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SPAM = 'spam'
}

/**
 * Account Status
 */
export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  BANNED = 'banned'
}
