import { UserRepository } from '@/repositories';
import { User, UserLogin, AuthResponse, UserResponse, ApiError } from '@/models';
import { JwtUtils, PasswordUtils, sanitizeUser } from '@/utils';
import logger from '@/logger';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Authenticate user and return JWT token
   */
  async login(loginData: UserLogin): Promise<AuthResponse> {
    const { email, password } = loginData;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      logger.warn('Login attempt with invalid email', { email });
      throw new ApiError(401, 'Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      logger.warn('Login attempt by inactive user', { email, userId: user.id });
      throw new ApiError(401, 'Account is disabled');
    }

    // Verify password
    const isPasswordValid = await PasswordUtils.verifyPassword(password, user.password);
    if (!isPasswordValid) {
      logger.warn('Login attempt with invalid password', { email, userId: user.id });
      throw new ApiError(401, 'Invalid credentials');
    }

    // Generate JWT token
    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const userResponse: UserResponse = sanitizeUser(user);

    return {
      user: userResponse,
      tokens: {
        accessToken,
      },
    };
  }

  /**
   * Get user profile by ID
   */
  async getUserProfile(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Account is disabled');
    }

    return sanitizeUser(user);
  }

  /**
   * Validate JWT token and return user data
   */
  async validateToken(token: string): Promise<UserResponse> {
    try {
      const decoded = JwtUtils.verifyToken(token);
      const user = await this.userRepository.findById(decoded.userId);

      if (!user) {
        throw new ApiError(401, 'User not found');
      }

      if (!user.isActive) {
        throw new ApiError(401, 'Account is disabled');
      }

      return sanitizeUser(user);
    } catch (error) {
      logger.warn('Token validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new ApiError(401, 'Invalid token');
    }
  }
}
