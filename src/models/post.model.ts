import { PostStatus } from '../types/enums';

/**
 * Post Entity Interface
 */
export interface IPost {
  id: string;
  title: string;
  slug: string; // URL-friendly version of title
  content: string;
  excerpt?: string; // Short summary
  featuredImage?: string; // URL to featured image
  authorId: string; // Reference to User
  status: PostStatus;
  tags: string[]; // Array of tag names
  categoryId?: string; // Reference to Category
  publishedAt?: Date;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Post creation payload
 */
export interface ICreatePost {
  title: string;
  slug?: string; // Auto-generated if not provided
  content: string;
  excerpt?: string;
  featuredImage?: string;
  authorId: string;
  status?: PostStatus;
  tags?: string[];
  categoryId?: string;
  publishedAt?: Date;
}

/**
 * Post update payload
 */
export interface IUpdatePost {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  status?: PostStatus;
  tags?: string[];
  categoryId?: string;
  publishedAt?: Date;
}

/**
 * Post response with author details
 */
export interface IPostResponse extends Omit<IPost, 'authorId'> {
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

/**
 * Post query/filter options
 */
export interface IPostQuery {
  status?: PostStatus;
  authorId?: string;
  categoryId?: string;
  tags?: string[];
  search?: string; // Search in title/content
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';
}
