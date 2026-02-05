/**
 * Post Service
 * Handles all database operations related to posts
 */

import prisma from '../config/database';
import { PostStatus, Prisma } from '@prisma/client';

export class PostService {
  /**
   * Create a new post
   */
  async createPost(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    featuredImage?: string;
    authorId: string;
    categoryId?: string;
    tags?: string[];
    status?: PostStatus;
    publishedAt?: Date;
  }) {
    const post = await prisma.post.create({
      data: {
        ...data,
        status: data.status || PostStatus.DRAFT,
        tags: data.tags || []
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        category: true
      }
    });

    return post;
  }

  /**
   * Get post by ID
   */
  async getPostById(id: string, includeUnpublished = false) {
    const where: Prisma.PostWhereInput = { id };
    
    if (!includeUnpublished) {
      where.status = PostStatus.PUBLISHED;
    }

    const post = await prisma.post.findFirst({
      where,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        category: true,
        comments: {
          where: { status: 'APPROVED' },
          include: {
            author: {
              select: {
                username: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // Increment view count if post is published
    if (post && post.status === PostStatus.PUBLISHED) {
      await prisma.post.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      });
    }

    return post;
  }

  /**
   * Get post by slug
   */
  async getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true
          }
        },
        category: true
      }
    });

    if (post && post.status === PostStatus.PUBLISHED) {
      await prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } }
      });
    }

    return post;
  }

  /**
   * Get all posts with filtering and pagination
   */
  async getAllPosts(options: {
    page?: number;
    limit?: number;
    status?: PostStatus;
    authorId?: string;
    categoryId?: string;
    tags?: string[];
    search?: string;
    sortBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'title';
    sortOrder?: 'asc' | 'desc';
  }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PostWhereInput = {};
    
    if (options.status) where.status = options.status;
    if (options.authorId) where.authorId = options.authorId;
    if (options.categoryId) where.categoryId = options.categoryId;
    if (options.tags && options.tags.length > 0) {
      where.tags = { hasEvery: options.tags };
    }
    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { content: { contains: options.search, mode: 'insensitive' } }
      ];
    }

    const orderBy: Prisma.PostOrderByWithRelationInput = {};
    const sortBy = options.sortBy || 'createdAt';
    const sortOrder = options.sortOrder || 'desc';
    orderBy[sortBy] = sortOrder;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true
            }
          },
          category: true,
          _count: {
            select: { comments: true }
          }
        },
        orderBy,
        take: limit,
        skip
      }),
      prisma.post.count({ where })
    ]);

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Update post
   */
  async updatePost(id: string, authorId: string, data: {
    title?: string;
    slug?: string;
    content?: string;
    excerpt?: string;
    featuredImage?: string;
    categoryId?: string;
    tags?: string[];
    status?: PostStatus;
    publishedAt?: Date;
  }) {
    // Verify ownership
    const existingPost = await prisma.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return { success: false, error: 'Post not found' };
    }

    if (existingPost.authorId !== authorId) {
      return { success: false, error: 'Unauthorized' };
    }

    const post = await prisma.post.update({
      where: { id },
      data,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true
          }
        },
        category: true
      }
    });

    return { success: true, data: post };
  }

  /**
   * Delete post
   */
  async deletePost(id: string, authorId: string) {
    const existingPost = await prisma.post.findUnique({
      where: { id }
    });

    if (!existingPost) {
      return { success: false, error: 'Post not found' };
    }

    if (existingPost.authorId !== authorId) {
      return { success: false, error: 'Unauthorized' };
    }

    await prisma.post.delete({
      where: { id }
    });

    return { success: true };
  }

  /**
   * Get post statistics
   */
  async getPostStats(authorId?: string) {
    const where: Prisma.PostWhereInput = authorId ? { authorId } : {};

    const [total, published, draft, byStatus, totalViews] = await Promise.all([
      prisma.post.count({ where }),
      prisma.post.count({ where: { ...where, status: PostStatus.PUBLISHED } }),
      prisma.post.count({ where: { ...where, status: PostStatus.DRAFT } }),
      prisma.post.groupBy({
        by: ['status'],
        where,
        _count: true
      }),
      prisma.post.aggregate({
        where,
        _sum: { viewCount: true }
      })
    ]);

    return {
      total,
      published,
      draft,
      byStatus,
      totalViews: totalViews._sum.viewCount || 0
    };
  }
}

// Export singleton instance
export default new PostService();
