import prisma from '../config/database';
import { Prisma } from '@prisma/client';

/**
 * Comment Service
 * Handles all comment-related business logic
 */

interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string; // For nested replies
}

interface UpdateCommentInput {
  content?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
}

interface CommentQueryOptions {
  postId?: string;
  authorId?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeReplies?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

class CommentService {
  /**
   * Create a new comment
   */
  async createComment(data: CreateCommentInput, authorId: string) {
    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: data.postId },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    // If this is a reply, verify parent comment exists
    if (data.parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: data.parentId },
      });

      if (!parentComment) {
        throw new Error('Parent comment not found');
      }

      if (parentComment.postId !== data.postId) {
        throw new Error('Parent comment must belong to the same post');
      }
    }

    const comment = await prisma.comment.create({
      data: {
        content: data.content,
        authorId,
        postId: data.postId,
        parentId: data.parentId,
        status: 'PENDING', // Default to pending for moderation
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return this.formatComment(comment);
  }

  /**
   * Get comments for a post with pagination
   */
  async getComments(options: CommentQueryOptions): Promise<PaginatedResponse<any>> {
    const {
      postId,
      authorId,
      status = 'APPROVED', // Only show approved comments by default
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeReplies = true,
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.CommentWhereInput = {
      ...(postId && { postId }),
      ...(authorId && { authorId }),
      status,
      parentId: includeReplies ? undefined : null, // Only root comments if not including replies
    };

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          replies: includeReplies
            ? {
                where: { status: 'APPROVED' },
                include: {
                  author: {
                    select: {
                      id: true,
                      username: true,
                      firstName: true,
                      lastName: true,
                      avatar: true,
                    },
                  },
                },
                orderBy: { createdAt: 'asc' },
              }
            : false,
        },
      }),
      prisma.comment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: comments.map((comment) => this.formatComment(comment)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  /**
   * Get a single comment by ID
   */
  async getCommentById(id: string) {
    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        replies: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!comment) {
      return null;
    }

    return this.formatComment(comment);
  }

  /**
   * Update a comment
   */
  async updateComment(id: string, data: UpdateCommentInput) {
    const comment = await prisma.comment.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return this.formatComment(comment);
  }

  /**
   * Delete a comment (and its replies)
   */
  async deleteComment(id: string) {
    // Prisma will cascade delete replies due to schema definition
    const comment = await prisma.comment.delete({
      where: { id },
    });

    return comment;
  }

  /**
   * Get comment count for a post
   */
  async getCommentCount(postId: string, includeReplies = true) {
    const where: Prisma.CommentWhereInput = {
      postId,
      status: 'APPROVED',
    };

    if (!includeReplies) {
      where.parentId = null;
    }

    return prisma.comment.count({ where });
  }

  /**
   * Moderate comment (approve/reject/spam)
   */
  async moderateComment(id: string, status: 'APPROVED' | 'REJECTED' | 'SPAM') {
    const comment = await prisma.comment.update({
      where: { id },
      data: { status },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return this.formatComment(comment);
  }

  /**
   * Get comments by user
   */
  async getUserComments(
    authorId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<PaginatedResponse<any>> {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where: { authorId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      }),
      prisma.comment.count({ where: { authorId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: comments.map((comment) => this.formatComment(comment)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    };
  }

  /**
   * Format comment for response
   */
  private formatComment(comment: any) {
    return {
      id: comment.id,
      content: comment.content,
      status: comment.status,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.author
        ? {
            id: comment.author.id,
            username: comment.author.username,
            firstName: comment.author.firstName,
            lastName: comment.author.lastName,
            avatar: comment.author.avatar,
          }
        : undefined,
      post: comment.post
        ? {
            id: comment.post.id,
            title: comment.post.title,
            slug: comment.post.slug,
          }
        : undefined,
      parentId: comment.parentId,
      replies: comment.replies
        ? comment.replies.map((reply: any) => this.formatComment(reply))
        : undefined,
      replyCount: comment.replies ? comment.replies.length : undefined,
    };
  }
}

export default new CommentService();
