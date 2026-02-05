/**
 * Role-Based Authorization Middleware
 * Checks if authenticated user has required role
 */

import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Middleware to check if user has required role(s)
 * NOTE: This middleware must be used AFTER authMiddleware
 * 
 * @param allowedRoles - Array of allowed roles
 * @returns Express middleware function
 * 
 * @example
 * // Only ADMIN can access
 * router.delete('/users/:id', authMiddleware, requireRole(['ADMIN']), deleteUser);
 * 
 * @example
 * // ADMIN or AUTHOR can access
 * router.post('/posts', authMiddleware, requireRole(['ADMIN', 'AUTHOR']), createPost);
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check if user is authenticated (authMiddleware should run first)
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
      return;
    }

    // Check if user's role is in the allowed roles
    if (!allowedRoles.includes(req.user.role as UserRole)) {
      res.status(403).json({
        success: false,
        error: 'You do not have permission to perform this action',
        requiredRoles: allowedRoles,
        yourRole: req.user.role
      });
      return;
    }

    // User has required role, continue
    next();
  };
};

/**
 * Middleware to require ADMIN role only
 * Shorthand for requireRole(['ADMIN'])
 */
export const requireAdmin = requireRole([UserRole.ADMIN]);

/**
 * Middleware to require AUTHOR or ADMIN role
 * Shorthand for requireRole(['ADMIN', 'AUTHOR'])
 */
export const requireAuthor = requireRole([UserRole.ADMIN, UserRole.AUTHOR]);

/**
 * Middleware to check if user owns the resource or is ADMIN
 * 
 * @param getUserId - Function to extract the owner's userId from request
 * @returns Express middleware function
 * 
 * @example
 * // Check if user owns the post or is admin
 * router.put(
 *   '/posts/:id',
 *   authMiddleware,
 *   requireOwnerOrAdmin(async (req) => {
 *     const post = await postService.getPostById(req.params.id);
 *     return post?.authorId;
 *   }),
 *   updatePost
 * );
 */
export const requireOwnerOrAdmin = (
  getUserId: (req: Request) => Promise<string | undefined> | string | undefined
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      // Admins can access everything
      if (req.user.role === UserRole.ADMIN) {
        next();
        return;
      }

      // Get the owner's userId
      const ownerId = await getUserId(req);

      if (!ownerId) {
        res.status(404).json({
          success: false,
          error: 'Resource not found'
        });
        return;
      }

      // Check if current user is the owner
      if (req.user.id !== ownerId) {
        res.status(403).json({
          success: false,
          error: 'You can only modify your own resources'
        });
        return;
      }

      // User is owner, continue
      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Authorization check failed'
      });
    }
  };
};
