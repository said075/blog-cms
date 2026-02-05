/**
 * Authentication Service
 * Handles user registration, login, and authentication logic
 */

import prisma from '../config/database';
import { hashPassword, comparePassword, validatePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { UserRole, AccountStatus, Prisma } from '@prisma/client';

export class AuthService {
  /**
   * Register a new user (Sign up)
   */
  async signup(data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      // Validate password strength
      const passwordValidation = validatePassword(data.password);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.message
        };
      }

      // Hash the password
      const hashedPassword = await hashPassword(data.password);

      // Create user in database
      const user = await prisma.user.create({
        data: {
          email: data.email.toLowerCase(),
          username: data.username,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.READER, // Default role
          status: AccountStatus.ACTIVE,
          emailVerified: false
        },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true
        }
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      return {
        success: true,
        data: {
          user,
          token
        }
      };
    } catch (error: unknown) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          // Unique constraint violation
          const target = error.meta?.target;
          const field = Array.isArray(target) && target.includes('email') ? 'email' : 'username';
          return {
            success: false,
            error: `This ${field} is already registered`
          };
        }
      }
      throw error;
    }
  }

  /**
   * Login a user
   */
  async login(credentials: { email: string; password: string }) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: credentials.email.toLowerCase() },
        select: {
          id: true,
          email: true,
          username: true,
          password: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          emailVerified: true
        }
      });

      // Check if user exists
      if (!user) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check if account is active
      if (user.status !== AccountStatus.ACTIVE) {
        return {
          success: false,
          error: 'Account is not active. Please contact support.'
        };
      }

      // Verify password
      const isPasswordValid = await comparePassword(credentials.password, user.password);
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: userWithoutPassword,
          token
        }
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify user credentials (for middleware)
   */
  async verifyUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true
      }
    });

    if (!user || user.status !== AccountStatus.ACTIVE) {
      return null;
    }

    return user;
  }

  /**
   * Change user password
   */
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    try {
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true }
      });

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify old password
      const isOldPasswordValid = await comparePassword(oldPassword, user.password);
      if (!isOldPasswordValid) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        return {
          success: false,
          error: passwordValidation.message
        };
      }

      // Hash new password
      const hashedPassword = await hashPassword(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      return {
        success: true,
        message: 'Password changed successfully'
      };
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
export default new AuthService();
