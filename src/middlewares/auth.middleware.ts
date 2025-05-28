import { Request, Response, NextFunction } from 'express';
import { JwtUtils } from '@/utils';
import { JwtPayload, UserRole } from '@/models';
import logger from '@/logger';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware to verify JWT tokens
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({
      success: false,
      error: 'Access token is required',
    });
    return;
  }

  try {
    const decoded = JwtUtils.verifyToken(token);
    req.user = decoded;

    logger.info('User authenticated', {
      userId: decoded.userId,
      email: decoded.email,
      endpoint: req.originalUrl,
    });

    next();
  } catch (error) {
    logger.warn('Authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      endpoint: req.originalUrl,
      token: token.substring(0, 20) + '...', // Log partial token for debugging
    });

    res.status(403).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }
};

/**
 * Authorization middleware to check user roles
 */
export const authorize = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Authorization failed', {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: roles,
        endpoint: req.originalUrl,
      });

      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
      return;
    }

    next();
  };
};
