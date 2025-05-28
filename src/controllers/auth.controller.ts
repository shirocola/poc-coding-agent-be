import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services';
import { UserLogin, ApiResponse, AuthResponse, UserResponse } from '@/models';
import logger from '@/logger';

export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/login
   * Authenticate user and return JWT token
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData: UserLogin = req.body;

      // Basic validation
      if (!loginData.email || !loginData.password) {
        res.status(400).json({
          success: false,
          error: 'Email and password are required',
        } as ApiResponse);
        return;
      }

      const authResponse: AuthResponse = await this.authService.login(loginData);

      logger.info('Login successful', {
        userId: authResponse.user.id,
        email: authResponse.user.email,
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        data: authResponse,
        message: 'Login successful',
      } as ApiResponse<AuthResponse>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /auth/profile
   * Get current user profile (requires authentication)
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required',
        } as ApiResponse);
        return;
      }

      const userProfile: UserResponse = await this.authService.getUserProfile(req.user.userId);

      res.status(200).json({
        success: true,
        data: userProfile,
      } as ApiResponse<UserResponse>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/validate
   * Validate JWT token
   */
  validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        res.status(400).json({
          success: false,
          error: 'Token is required',
        } as ApiResponse);
        return;
      }

      const userProfile: UserResponse = await this.authService.validateToken(token);

      res.status(200).json({
        success: true,
        data: userProfile,
        message: 'Token is valid',
      } as ApiResponse<UserResponse>);
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /auth/logout
   * Logout user (for completeness, actual logout handled client-side by removing token)
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('User logged out', {
        userId: req.user?.userId,
        ip: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  };
}
