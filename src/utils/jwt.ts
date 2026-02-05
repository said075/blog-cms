/**
 * JWT Utility
 * Handles JSON Web Token generation and verification
 */

import jwt from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

// JWT Payload Interface
export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Get JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token
 * @param payload - User data to include in token
 * @returns Signed JWT token
 */
export function generateToken(payload: JwtPayload): string {
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string
  } as jwt.SignOptions);
  return token;
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload or null if invalid
 */
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Decode a JWT token without verifying (useful for debugging)
 * WARNING: Do not use for authentication!
 * @param token - JWT token to decode
 * @returns Decoded payload or null
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
