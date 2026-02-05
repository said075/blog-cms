/**
 * User Service
 * Handles all database operations related to users
 */

import prisma from '../config/database';
import { UserRole, AccountStatus, Prisma } from '@prisma/client';

export class UserService {
  /**
   * Create a new user
   */
  async createUser(data: {
    email: string;
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  }) {
    try {
      const user = await prisma.user.create({
        data: {
          ...data,
          role: data.role || UserRole.READER,
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
          // Note: password is NOT selected for security
        }
      });

      return { success: true, data: user };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return { success: false, error: 'Email or username already exists' };
        }
      }
      throw error;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        username: true,
        password: true, // Included for authentication
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        emailVerified: true
      }
    });

    return user;
  }

  /**
   * Find user by ID (without password)
   */
  async findById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        role: true,
        avatar: true,
        bio: true,
        status: true,
        emailVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  /**
   * Get all users with pagination
   */
  async getAllUsers(options: {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: AccountStatus;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (options.role) where.role = options.role;
    if (options.status) where.status = options.status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip
      }),
      prisma.user.count({ where })
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    bio?: string;
    role?: UserRole;
    status?: AccountStatus;
  }) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          role: true,
          avatar: true,
          bio: true,
          status: true,
          updatedAt: true
        }
      });

      return { success: true, data: user };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          return { success: false, error: 'Email or username already taken' };
        }
        if (error.code === 'P2025') {
          return { success: false, error: 'User not found' };
        }
      }
      throw error;
    }
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string) {
    await prisma.user.update({
      where: { id },
      data: { lastLogin: new Date() }
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    try {
      await prisma.user.delete({
        where: { id }
      });
      return { success: true };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          return { success: false, error: 'User not found' };
        }
      }
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    const [total, byRole, byStatus] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.user.groupBy({
        by: ['status'],
        _count: true
      })
    ]);

    return {
      total,
      byRole,
      byStatus
    };
  }
}

// Export singleton instance
export default new UserService();
