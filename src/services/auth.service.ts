import { UserRepository } from '@/repositories';
import {
  User,
  UserLogin,
  UserRegistration,
  AuthResponse,
  UserResponse,
  ApiError,
  UserRole,
} from '@/models';
import { JwtUtils, PasswordUtils, sanitizeUser } from '@/utils';
import logger from '@/logger';

export class AuthService {
  constructor(private userRepository: UserRepository) {}

  /**
   * Register a new user
   */
  async register(registrationData: UserRegistration): Promise<AuthResponse> {
    const { email, password, firstName, lastName, employeeId } = registrationData;

    // Check if user already exists by email
    const existingUserByEmail = await this.userRepository.findByEmail(email);
    if (existingUserByEmail) {
      logger.warn('Registration attempt with existing email', { email });
      throw new ApiError(409, 'User with this email already exists');
    }

    // Check if user already exists by employeeId
    const existingUserByEmployeeId = await this.userRepository.findByEmployeeId(employeeId);
    if (existingUserByEmployeeId) {
      logger.warn('Registration attempt with existing employee ID', { employeeId });
      throw new ApiError(409, 'User with this employee ID already exists');
    }

    // Validate password strength
    const passwordValidation = PasswordUtils.validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      logger.warn('Registration attempt with weak password', { email });
      throw new ApiError(400, 'Password does not meet security requirements', 'WEAK_PASSWORD', {
        errors: passwordValidation.errors,
      });
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hashPassword(password);

    // Create user
    const userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      employeeId,
      role: UserRole.EMPLOYEE, // Default role for new registrations
      isActive: true,
    };

    const user = await this.userRepository.create(userData);

    // Generate JWT token
    const accessToken = JwtUtils.generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      employeeId: user.employeeId,
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
