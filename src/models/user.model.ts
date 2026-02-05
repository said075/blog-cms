import { UserRole, AccountStatus } from '../types/enums';

/**
 * User Entity Interface
 */
export interface IUser {
  id: string;
  email: string;
  username: string;
  password: string; // Hashed password
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string; // URL to profile image
  bio?: string;
  status: AccountStatus;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User creation payload (without system-generated fields)
 */
export interface ICreateUser {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  avatar?: string;
  bio?: string;
}

/**
 * User update payload (partial update)
 */
export interface IUpdateUser {
  email?: string;
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  avatar?: string;
  bio?: string;
  status?: AccountStatus;
}

/**
 * User response (without sensitive data)
 */
export interface IUserResponse {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  status: AccountStatus;
  emailVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
