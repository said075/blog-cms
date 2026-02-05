/**
 * Enhanced Post Controller with Production Features
 */

import { Request, Response } from 'express';
import postService from '../services/post.service';
import { PostStatus } from '@prisma/client';

class PostController {
  /**
   * Create a new post
   * POST /api/posts
   */
  async createPost(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { title, content, excerpt, featuredImage, categoryId, tags, status } = req.body;

      if (!title || !content) {
        return res.status(400).json({
          success: false,
          error: 'Title and content are required',
        });
      }

      const post = await postService.createPost(
        {
          title,
          content,
          excerpt,
          featuredImage,
          categoryId,
          tags,
          status: status || PostStatus.DRAFT,
        },
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        data: post,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create post',
      });
    }
  }

  /**
   * Get all posts with advanced filters, search, and pagination
   * GET /api/posts?page=1&limit=10&search=nodejs&sortBy=createdAt&sortOrder=desc
   */
  async getPosts(req: Request, res: Response) {
    try {
      const {
        page,
        limit,
        authorId,
        categoryId,
        status,
        tags,
        search,
        sortBy,
        sortOrder,
      } = req.query;

      const options = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
        authorId: authorId as string,
        categoryId: categoryId as string,
        status: status as PostStatus,
        tags: tags ? (tags as string).split(',') : undefined,
        search: search as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as 'asc' | 'desc',
      };

      const result = await postService.getPosts(options);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch posts',
      });
    }
  }

  /**
   * Get a single post by ID
   * GET /api/posts/:id
   */
  async getPostById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const includeUnpublished = req.user?.role === 'ADMIN' || req.user?.role === 'AUTHOR';

      const post = await postService.getPostById(id, includeUnpublished);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        });
      }

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch post',
      });
    }
  }

  /**
   * Get a post by slug
   * GET /api/posts/slug/:slug
   */
  async getPostBySlug(req: Request, res: Response) {
    try {
      const slug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;

      const post = await postService.getPostBySlug(slug);

      if (!post) {
        return res.status(404).json({
          success: false,
          error: 'Post not found',
        });
      }

      res.status(200).json({
        success: true,
        data: post,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch post',
      });
    }
  }

  /**
   * Update a post
   * PUT /api/posts/:id
   */
  async updatePost(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { title, content, excerpt, featuredImage, categoryId, tags, status } = req.body;

      const post = await postService.updatePost(id, {
        title,
        content,
        excerpt,
        featuredImage,
        categoryId,
        tags,
        status,
      });

      res.status(200).json({
        success: true,
        message: 'Post updated successfully',
        data: post,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update post',
      });
    }
  }

  /**
   * Delete a post
   * DELETE /api/posts/:id
   */
  async deletePost(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      await postService.deletePost(id);

      res.status(200).json({
        success: true,
        message: 'Post deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to delete post',
      });
    }
  }

  /**
   * Get post statistics
   * GET /api/posts/stats
   */
  async getPostStats(req: Request, res: Response) {
    try {
      const authorId = req.query.authorId as string;
      const stats = await postService.getPostStats(authorId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch stats',
      });
    }
  }

  /**
   * Get trending posts
   * GET /api/posts/trending
   */
  async getTrendingPosts(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const posts = await postService.getTrendingPosts(limit);

      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch trending posts',
      });
    }
  }

  /**
   * Get related posts
   * GET /api/posts/:id/related
   */
  async getRelatedPosts(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

      const posts = await postService.getRelatedPosts(id, limit);

      res.status(200).json({
        success: true,
        data: posts,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch related posts',
      });
    }
  }
}

export default new PostController();
