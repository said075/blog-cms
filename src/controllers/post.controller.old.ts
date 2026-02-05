/**
 * Post Controller
 * Handles HTTP requests for post endpoints
 */

import { Request, Response } from 'express';
import postService from '../services/post.service';
import { createUniqueSlug } from '../utils/slugify';
import prisma from '../config/database';
import { PostStatus } from '@prisma/client';

/**
 * Create a new post
 * POST /api/posts
 * Requires: AUTHOR or ADMIN role
 */
export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content, excerpt, featuredImage, categoryId, tags, status, publishedAt } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    // Validate required fields
    if (!title || !content) {
      res.status(400).json({
        success: false,
        error: 'Title and content are required'
      });
      return;
    }

    // Generate unique slug from title
    const slug = await createUniqueSlug(title, async (slug) => {
      const existing = await prisma.post.findUnique({ where: { slug } });
      return !!existing;
    });

    // Create post
    const post = await postService.createPost({
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      authorId: req.user.id,
      categoryId,
      tags: tags || [],
      status: status || PostStatus.DRAFT,
      publishedAt: status === PostStatus.PUBLISHED ? (publishedAt || new Date()) : undefined
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post'
    });
  }
};

/**
 * Get all posts with filters
 * GET /api/posts
 * Public (but can see more if authenticated)
 */
export const getAllPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page,
      limit,
      status,
      authorId,
      categoryId,
      tags,
      search,
      sortBy,
      sortOrder
    } = req.query;

    // Non-authenticated users can only see published posts
    const postStatus = req.user 
      ? (status as PostStatus) 
      : PostStatus.PUBLISHED;

    const result = await postService.getAllPosts({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: postStatus,
      authorId: authorId as string,
      categoryId: categoryId as string,
      tags: tags ? (tags as string).split(',') : undefined,
      search: search as string,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts'
    });
  }
};

/**
 * Get single post by ID
 * GET /api/posts/:id
 * Public for published posts, requires auth for drafts
 */
export const getPostById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    // Authenticated users can see unpublished posts (if they own them or are admin)
    const includeUnpublished = !!req.user;
    const post = await postService.getPostById(id, includeUnpublished);

    if (!post) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      });
      return;
    }

    // Check if user can see this post
    if (post.status !== PostStatus.PUBLISHED) {
      if (!req.user) {
        res.status(404).json({ success: false, error: 'Post not found' });
        return;
      }

      // Only author or admin can see unpublished posts
      if (req.user.role !== 'ADMIN' && post.authorId !== req.user.id) {
        res.status(403).json({
          success: false,
          error: 'You do not have permission to view this post'
        });
        return;
      }
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post'
    });
  }
};

/**
 * Get post by slug
 * GET /api/posts/slug/:slug
 * Public for published posts
 */
export const getPostBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

    const post = await postService.getPostBySlug(slug);

    if (!post) {
      res.status(404).json({
        success: false,
        error: 'Post not found'
      });
      return;
    }

    // Only published posts are accessible by slug (unless authenticated)
    if (post.status !== PostStatus.PUBLISHED) {
      if (!req.user || (req.user.role !== 'ADMIN' && post.authorId !== req.user.id)) {
        res.status(404).json({ success: false, error: 'Post not found' });
        return;
      }
    }

    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    console.error('Get post by slug error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post'
    });
  }
};

/**
 * Update a post
 * PUT /api/posts/:id
 * Requires: Post owner or ADMIN
 */
export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { title, slug, content, excerpt, featuredImage, categoryId, tags, status, publishedAt } = req.body;

    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    // If slug is being changed, ensure it's unique
    let finalSlug = slug;
    if (title && !slug) {
      finalSlug = await createUniqueSlug(title, async (slug) => {
        const existing = await prisma.post.findFirst({
          where: { slug, id: { not: id } }
        });
        return !!existing;
      });
    }

    const updateData: any = {};
    if (title) updateData.title = title;
    if (finalSlug) updateData.slug = finalSlug;
    if (content) updateData.content = content;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featuredImage !== undefined) updateData.featuredImage = featuredImage;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (tags !== undefined) updateData.tags = tags;
    if (status) {
      updateData.status = status;
      if (status === PostStatus.PUBLISHED && !publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (publishedAt) updateData.publishedAt = new Date(publishedAt);

    const result = await postService.updatePost(id, req.user.id, updateData);

    if (!result.success) {
      const statusCode = result.error === 'Post not found' ? 404 : 
                        result.error === 'Unauthorized' ? 403 : 400;
      res.status(statusCode).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update post'
    });
  }
};

/**
 * Delete a post
 * DELETE /api/posts/:id
 * Requires: Post owner or ADMIN
 */
export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const result = await postService.deletePost(id, req.user.id);

    if (!result.success) {
      const statusCode = result.error === 'Post not found' ? 404 : 
                        result.error === 'Unauthorized' ? 403 : 400;
      res.status(statusCode).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post'
    });
  }
};

/**
 * Get posts by current user
 * GET /api/posts/my/posts
 * Requires: Authentication
 */
export const getMyPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    const { page, limit, status, sortBy, sortOrder } = req.query;

    const result = await postService.getAllPosts({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      status: status as PostStatus,
      authorId: req.user.id,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any
    });

    res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get my posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your posts'
    });
  }
};

/**
 * Get post statistics
 * GET /api/posts/stats
 * Requires: Authentication (shows own stats, or all stats for admin)
 */
export const getPostStats = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Not authenticated' });
      return;
    }

    // Admins see all stats, others see only their own
    const authorId = req.user.role === 'ADMIN' ? undefined : req.user.id;
    const stats = await postService.getPostStats(authorId);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get post stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
};
