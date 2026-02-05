/**
 * Common API Response Types
 */

export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface IPaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface IErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}

/**
 * Authentication types
 */
export interface ILoginCredentials {
  email: string;
  password: string;
}

export interface IRegisterCredentials {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      username: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    token: string;
    refreshToken?: string;
  };
}

/**
 * JWT Payload
 */
export interface IJwtPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
