/**
 * Authentication Controller
 * Handles HTTP requests for authentication endpoints
 */

import { Request, Response } from 'express';
import authService from '../services/auth.service';

/**
 * Sign up a new user
 * POST /api/auth/signup
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password, firstName, lastName } = req.body;

    // Validate required fields
    if (!email || !username || !password || !firstName || !lastName) {
      res.status(400).json({
        success: false,
        error: 'All fields are required: email, username, password, firstName, lastName'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
      return;
    }

    // Validate username (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      res.status(400).json({
        success: false,
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores'
      });
      return;
    }

    // Call auth service
    const result = await authService.signup({
      email,
      username,
      password,
      firstName,
      lastName
    });

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create account. Please try again.'
    });
  }
};

/**
 * Login a user
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
      return;
    }

    // Call auth service
    const result = await authService.login({ email, password });

    if (!result.success) {
      res.status(401).json(result);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result.data
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

/**
 * Get current user profile (requires authentication)
 * GET /api/auth/me
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    // User is already attached by authMiddleware
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user profile'
    });
  }
};

/**
 * Change password (requires authentication)
 * PUT /api/auth/change-password
 */
export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Not authenticated'
      });
      return;
    }

    if (!oldPassword || !newPassword) {
      res.status(400).json({
        success: false,
        error: 'Old password and new password are required'
      });
      return;
    }

    const result = await authService.changePassword(
      req.user.id,
      oldPassword,
      newPassword
    );

    if (!result.success) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change password'
    });
  }
};

/**
 * Logout (client-side should delete token)
 * POST /api/auth/logout
 */
export const logout = async (req: Request, res: Response): Promise<void> => {
  // With JWT, logout is handled client-side by deleting the token
  // This endpoint is just for completeness and can track logout events
  res.status(200).json({
    success: true,
    message: 'Logged out successfully. Please delete your token.'
  });
};
