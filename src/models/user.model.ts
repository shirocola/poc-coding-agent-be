export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  user: UserResponse;
  tokens: AuthTokens;
}

export enum UserRole {
  EMPLOYEE = 'employee',
  ADMIN = 'admin',
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}