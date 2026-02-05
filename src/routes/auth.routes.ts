/**
 * Authentication Routes
 * Defines all authentication-related endpoints
 */

import { Router } from 'express';
import {
  signup,
  login,
  getMe,
  changePassword,
  logout
} from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user
 * @access  Public
 */
router.post('/signup', signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private (requires authentication)
 */
router.get('/me', authMiddleware, getMe);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private (requires authentication)
 */
router.put('/change-password', authMiddleware, changePassword);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client should delete token)
 * @access  Public
 */
router.post('/logout', logout);

export default router;
