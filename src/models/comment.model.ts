import { CommentStatus } from '../types/enums';

/**
 * Comment Entity Interface
 */
export interface IComment {
  id: string;
  content: string;
  postId: string; // Reference to Post
  authorId: string; // Reference to User
  parentId?: string; // For nested comments/replies
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Comment creation payload
 */
export interface ICreateComment {
  content: string;
  postId: string;
  authorId: string;
  parentId?: string; // For replies
}

/**
 * Comment update payload
 */
export interface IUpdateComment {
  content?: string;
  status?: CommentStatus;
}

/**
 * Comment response with author details
 */
export interface ICommentResponse extends Omit<IComment, 'authorId'> {
  author: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  replies?: ICommentResponse[]; // Nested replies
}

/**
 * Comment query/filter options
 */
export interface ICommentQuery {
  postId?: string;
  authorId?: string;
  status?: CommentStatus;
  parentId?: string | null; // null for top-level comments only
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
