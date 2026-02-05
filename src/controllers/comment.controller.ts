import { Request, Response } from 'express';
import commentService from '../services/comment.service';

/**
 * Comment Controller
 * Handles HTTP requests for comment operations
 */

class CommentController {
  /**
   * Create a new comment
   * POST /api/comments
   */
  async createComment(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { content, postId, parentId } = req.body;

      if (!content || !postId) {
        return res.status(400).json({
          success: false,
          error: 'Content and postId are required',
        });
      }

      const comment = await commentService.createComment(
        { content, postId, parentId },
        req.user.id
      );

      res.status(201).json({
        success: true,
        message: 'Comment created successfully',
        data: comment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to create comment',
      });
    }
  }

  /**
   * Get comments for a post
   * GET /api/comments?postId=xxx&page=1&limit=10
   */
  async getComments(req: Request, res: Response) {
    try {
      const {
        postId,
        authorId,
        status,
        page,
        limit,
        sortBy,
        sortOrder,
        includeReplies,
      } = req.query;

      const options = {
        postId: postId as string,
        authorId: authorId as string,
        status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as string,
        sortOrder: sortOrder as 'asc' | 'desc',
        includeReplies: includeReplies === 'true',
      };

      const result = await commentService.getComments(options);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch comments',
      });
    }
  }

  /**
   * Get a single comment by ID
   * GET /api/comments/:id
   */
  async getCommentById(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      const comment = await commentService.getCommentById(id);

      if (!comment) {
        return res.status(404).json({
          success: false,
          error: 'Comment not found',
        });
      }

      res.status(200).json({
        success: true,
        data: comment,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch comment',
      });
    }
  }

  /**
   * Update a comment
   * PUT /api/comments/:id
   */
  async updateComment(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { content } = req.body;

      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Content is required',
        });
      }

      const comment = await commentService.updateComment(id, { content });

      res.status(200).json({
        success: true,
        message: 'Comment updated successfully',
        data: comment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to update comment',
      });
    }
  }

  /**
   * Delete a comment
   * DELETE /api/comments/:id
   */
  async deleteComment(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

      await commentService.deleteComment(id);

      res.status(200).json({
        success: true,
        message: 'Comment deleted successfully',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to delete comment',
      });
    }
  }

  /**
   * Get comment count for a post
   * GET /api/posts/:postId/comments/count
   */
  async getCommentCount(req: Request, res: Response) {
    try {
      const postId = Array.isArray(req.params.postId)
        ? req.params.postId[0]
        : req.params.postId;
      const includeReplies = req.query.includeReplies !== 'false';

      const count = await commentService.getCommentCount(postId, includeReplies);

      res.status(200).json({
        success: true,
        data: {
          postId,
          count,
          includeReplies,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch comment count',
      });
    }
  }

  /**
   * Moderate a comment (admin only)
   * PATCH /api/comments/:id/moderate
   */
  async moderateComment(req: Request, res: Response) {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body;

      if (!['APPROVED', 'REJECTED', 'SPAM'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status. Must be APPROVED, REJECTED, or SPAM',
        });
      }

      const comment = await commentService.moderateComment(id, status);

      res.status(200).json({
        success: true,
        message: `Comment ${status.toLowerCase()} successfully`,
        data: comment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message || 'Failed to moderate comment',
      });
    }
  }

  /**
   * Get user's own comments
   * GET /api/comments/me
   */
  async getMyComments(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
        });
      }

      const { page, limit } = req.query;
      const options = {
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await commentService.getUserComments(req.user.id, options);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch comments',
      });
    }
  }
}

export default new CommentController();
