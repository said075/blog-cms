/**
 * Post Routes
 * Defines all blog post endpoints
 */

import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  getMyPosts,
  getPostStats
} from '../controllers/post.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middlewares/auth.middleware';
import { requireAuthor, requireOwnerOrAdmin } from '../middlewares/role.middleware';
import postService from '../services/post.service';

const router = Router();

/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private (AUTHOR or ADMIN only)
 */
router.post('/', authMiddleware, requireAuthor, createPost);

/**
 * @route   GET /api/posts
 * @desc    Get all posts with filters
 * @access  Public (but authenticated users see more)
 */
router.get('/', optionalAuthMiddleware, getAllPosts);

/**
 * @route   GET /api/posts/my/posts
 * @desc    Get current user's posts
 * @access  Private (authenticated users)
 */
router.get('/my/posts', authMiddleware, getMyPosts);

/**
 * @route   GET /api/posts/stats
 * @desc    Get post statistics
 * @access  Private (own stats or all for admin)
 */
router.get('/stats', authMiddleware, getPostStats);

/**
 * @route   GET /api/posts/slug/:slug
 * @desc    Get post by slug
 * @access  Public (published posts)
 */
router.get('/slug/:slug', optionalAuthMiddleware, getPostBySlug);

/**
 * @route   GET /api/posts/:id
 * @desc    Get post by ID
 * @access  Public for published, private for drafts
 */
router.get('/:id', optionalAuthMiddleware, getPostById);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Private (post owner or ADMIN)
 */
router.put(
  '/:id',
  authMiddleware,
  requireOwnerOrAdmin(async (req) => {
    const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const post = await postService.getPostById(postId, true);
    return post?.authorId;
  }),
  updatePost
);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Private (post owner or ADMIN)
 */
router.delete(
  '/:id',
  authMiddleware,
  requireOwnerOrAdmin(async (req) => {
    const postId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const post = await postService.getPostById(postId, true);
    return post?.authorId;
  }),
  deletePost
);

export default router;
