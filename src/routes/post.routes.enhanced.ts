import { Router } from 'express';
import postController from '../controllers/post.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAuthor, requireOwnerOrAdmin } from '../middlewares/role.middleware';
import postService from '../services/post.service';

const router = Router();

/**
 * Post Routes - Production Ready
 */

// Public routes
/**
 * @route   GET /api/posts
 * @desc    Get all posts with pagination, search, and filters
 * @access  Public
 * @query   page, limit, search, authorId, categoryId, status, tags, sortBy, sortOrder
 */
router.get('/', postController.getPosts);

/**
 * @route   GET /api/posts/trending
 * @desc    Get trending posts (most viewed)
 * @access  Public
 * @query   limit
 */
router.get('/trending', postController.getTrendingPosts);

/**
 * @route   GET /api/posts/stats
 * @desc    Get post statistics
 * @access  Public
 * @query   authorId (optional)
 */
router.get('/stats', postController.getPostStats);

/**
 * @route   GET /api/posts/slug/:slug
 * @desc    Get a single post by slug
 * @access  Public
 */
router.get('/slug/:slug', postController.getPostBySlug);

/**
 * @route   GET /api/posts/:id
 * @desc    Get a single post by ID
 * @access  Public
 */
router.get('/:id', postController.getPostById);

/**
 * @route   GET /api/posts/:id/related
 * @desc    Get related posts
 * @access  Public
 * @query   limit
 */
router.get('/:id/related', postController.getRelatedPosts);

// Protected routes (AUTHOR or ADMIN)
/**
 * @route   POST /api/posts
 * @desc    Create a new post
 * @access  Private (AUTHOR or ADMIN)
 */
router.post('/', authMiddleware, requireAuthor, postController.createPost);

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
    return post?.author?.id;
  }),
  postController.updatePost
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
    return post?.author?.id;
  }),
  postController.deletePost
);

export default router;
