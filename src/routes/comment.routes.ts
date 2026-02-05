import { Router } from 'express';
import commentController from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { requireAdmin, requireOwnerOrAdmin } from '../middlewares/role.middleware';
import commentService from '../services/comment.service';

const router = Router();

/**
 * Comment Routes
 */

// Public routes
/**
 * @route   GET /api/comments
 * @desc    Get comments (with filters)
 * @access  Public
 * @query   postId, page, limit, sortBy, sortOrder
 */
router.get('/', commentController.getComments);

/**
 * @route   GET /api/comments/:id
 * @desc    Get a single comment by ID
 * @access  Public
 */
router.get('/:id', commentController.getCommentById);

/**
 * @route   GET /api/posts/:postId/comments/count
 * @desc    Get comment count for a post
 * @access  Public
 */
router.get('/posts/:postId/count', commentController.getCommentCount);

// Protected routes (authenticated users)
/**
 * @route   POST /api/comments
 * @desc    Create a new comment
 * @access  Private (authenticated users)
 */
router.post('/', authMiddleware, commentController.createComment);

/**
 * @route   GET /api/comments/me
 * @desc    Get current user's comments
 * @access  Private (authenticated users)
 */
router.get('/me', authMiddleware, commentController.getMyComments);

/**
 * @route   PUT /api/comments/:id
 * @desc    Update a comment
 * @access  Private (comment owner or admin)
 */
router.put(
  '/:id',
  authMiddleware,
  requireOwnerOrAdmin(async (req) => {
    const commentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const comment = await commentService.getCommentById(commentId);
    return comment?.author?.id;
  }),
  commentController.updateComment
);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Delete a comment
 * @access  Private (comment owner or admin)
 */
router.delete(
  '/:id',
  authMiddleware,
  requireOwnerOrAdmin(async (req) => {
    const commentId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const comment = await commentService.getCommentById(commentId);
    return comment?.author?.id;
  }),
  commentController.deleteComment
);

/**
 * @route   PATCH /api/comments/:id/moderate
 * @desc    Moderate a comment (approve/reject/spam)
 * @access  Private (admin only)
 */
router.patch('/:id/moderate', authMiddleware, requireAdmin, commentController.moderateComment);

export default router;
