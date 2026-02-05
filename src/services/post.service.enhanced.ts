/**
 * Enhanced Post Service with Production-Ready Features
 * - Advanced pagination with metadata
 * - Full-text search
 * - Multiple filters and sorting
 * - Performance optimizations
 */

import prisma from '../config/database';
import { PostStatus, Prisma } from '@prisma/client';
import { slugify } from '../utils/slugify';

interface CreatePostInput {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: string;
  tags?: string[];
  status?: PostStatus;
}

interface UpdatePostInput {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  categoryId?: string;
  tags?: string[];
  status?: PostStatus;
}

interface PostQueryOptions {
  // Pagination
  page?: number;
  limit?: number;

  // Filters
  authorId?: string;
  categoryId?: string;
  status?: PostStatus;
  tags?: string[];

  // Search
  search?: string;

  // Sorting
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'viewCount' | 'title';
  sortOrder?: 'asc' | 'desc';

  // Include options
  includeAuthor?: boolean;
  includeCategory?: boolean;
  includeComments?: boolean;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

export class EnhancedPostService {
  /**
   * Create a new post with auto-generated slug
   */
  async createPost(data: CreatePostInput, authorId: string) {
    const slug = slugify(data.title);

    // Check if slug already exists
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    const finalSlug = existingPost ? `${slug}-${Date.now()}` : slug;

    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: finalSlug,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featuredImage,
        authorId,
        categoryId: data.categoryId,
        tags: data.tags || [],
        status: data.status || PostStatus.DRAFT,
        publishedAt: data.status === PostStatus.PUBLISHED ? new Date() : null,
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
        category: true,
      },
    });

    return post;
  }

  /**
   * Get posts with advanced pagination, search, and filters
   */
  async getPosts(options: PostQueryOptions = {}): Promise<PaginatedResponse<any>> {
    const {
      page = 1,
      limit = 10,
      authorId,
      categoryId,
      status = PostStatus.PUBLISHED,
      tags,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeAuthor = true,
      includeCategory = true,
      includeComments = false,
    } = options;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PostWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasSome: tags,
      };
    }

    // Full-text search
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Execute query with pagination
    const [posts, total] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          author: includeAuthor
            ? {
                select: {
                  id: true,
                  username: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              }
            : false,
          category: includeCategory,
          comments: includeComments
            ? {
                where: { status: 'APPROVED', parentId: null },
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                  author: {
                    select: {
                      username: true,
                      avatar: true,
                    },
                  },
                },
                orderBy: { createdAt: 'desc' },
                take: 5, // Limit comments per post
              }
            : false,
          _count: {
            select: {
              comments: {
                where: { status: 'APPROVED' },
              },
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
        hasPrevious: page > 1,
      },
    };
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
            avatar: true,
            bio: true,
          },
        },
        category: true,
        _count: {
          select: {
            comments: {
              where: { status: 'APPROVED' },
            },
          },
        },
      },
    });

    // Increment view count if post is published
    if (post && post.status === PostStatus.PUBLISHED) {
      await prisma.post.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return post;
  }

  /**
   * Get post by slug
   */
  async getPostBySlug(slug: string) {
    const post = await prisma.post.findUnique({
      where: { slug, status: PostStatus.PUBLISHED },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            avatar: true,
            bio: true,
          },
        },
        category: true,
        _count: {
          select: {
            comments: {
              where: { status: 'APPROVED' },
            },
          },
        },
      },
    });

    // Increment view count
    if (post) {
      await prisma.post.update({
        where: { id: post.id },
        data: { viewCount: { increment: 1 } },
      });
    }

    return post;
  }

  /**
   * Update a post
   */
  async updatePost(id: string, data: UpdatePostInput) {
    const updateData: any = { ...data };

    // Regenerate slug if title changed
    if (data.title) {
      updateData.slug = slugify(data.title);
    }

    // Set publishedAt if status changed to PUBLISHED
    if (data.status === PostStatus.PUBLISHED) {
      const existingPost = await prisma.post.findUnique({
        where: { id },
        select: { publishedAt: true },
      });

      if (!existingPost?.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
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
        category: true,
      },
    });

    return post;
  }

  /**
   * Delete a post
   */
  async deletePost(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  }

  /**
   * Get post statistics
   */
  async getPostStats(authorId?: string) {
    const where: Prisma.PostWhereInput = authorId ? { authorId } : {};

    const [total, published, draft, archived, totalViews] = await prisma.$transaction([
      prisma.post.count({ where }),
      prisma.post.count({ where: { ...where, status: PostStatus.PUBLISHED } }),
      prisma.post.count({ where: { ...where, status: PostStatus.DRAFT } }),
      prisma.post.count({ where: { ...where, status: PostStatus.ARCHIVED } }),
      prisma.post.aggregate({
        where,
        _sum: {
          viewCount: true,
        },
      }),
    ]);

    return {
      total,
      published,
      draft,
      archived,
      totalViews: totalViews._sum.viewCount || 0,
    };
  }

  /**
   * Get trending posts (most viewed)
   */
  async getTrendingPosts(limit = 10) {
    return prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      orderBy: { viewCount: 'desc' },
      take: limit,
      include: {
        author: {
          select: {
            username: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: {
              where: { status: 'APPROVED' },
            },
          },
        },
      },
    });
  }

  /**
   * Get related posts (by tags or category)
   */
  async getRelatedPosts(postId: string, limit = 5) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { tags: true, categoryId: true },
    });

    if (!post) return [];

    return prisma.post.findMany({
      where: {
        id: { not: postId },
        status: PostStatus.PUBLISHED,
        OR: [
          { tags: { hasSome: post.tags } },
          { categoryId: post.categoryId },
        ],
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });
  }
}

export default new EnhancedPostService();
