import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { Response } from 'express';
import { AuthProvider, Auth } from './auth.entity';
import { AuthRepository } from './auth.repository';

/** Google OAuth user information interface */
export interface GoogleUser {
  id: string; // Google OAuth ID
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

/** Authentication result interface */
export interface AuthResult {
  accessToken: string;
  user: User;
}

/** JWT payload type definition */
export interface JwtPayload {
  sub: number;
  email?: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/** Token generation result interface */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** JWT payload type guard */
function isValidJwtPayload(token: unknown): token is JwtPayload {
  if (typeof token !== 'object' || token === null) {
    return false;
  }

  const obj = token as Record<string, unknown>;

  return (
    'sub' in obj &&
    'type' in obj &&
    typeof obj.sub === 'number' &&
    (obj.type === 'access' || obj.type === 'refresh')
  );
}

/**
 * Authentication Service
 * - Google OAuth user validation and processing
 * - JWT token generation
 * - User account linking and creation
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // ===== Authentication and Validation Methods =====

  /** Google OAuth user validation and login processing */
  async validateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<AuthResult | undefined> {
    const { id: oauthId, email, firstName, lastName, picture } = googleUser;

    // 1. Check if user exists by email
    let user = await this.userService.findByEmail(email);
    let auth: Auth | null = null;

    // 1-1. If user does not exist, create one
    if (!user) {
      user = await this.userService.createUser({
        email,
        name: `${firstName} ${lastName}`.trim(),
        nickname: email.split('@')[0],
        profilePicture: picture,
        isActive: true,
      });

      // Create auth record for the new user
      await this.authRepository.createAuth(
        {
          oauthId,
          provider: AuthProvider.GOOGLE,
        },
        user,
      );

      return this.generateAuthResult(user);
    }

    // 1-2. If user exists, find auth record
    auth = await this.findAuthByUserId(user.id);

    if (!auth) {
      throw new BadRequestException(`"${email}" has no auth record.`);
    }

    if (auth.provider !== AuthProvider.GOOGLE) {
      throw new BadRequestException(
        `"${email}" already exists with a different login method.`,
      );
    }

    return this.generateAuthResult(user);
  }

  /** JWT token generation helper */
  private generateAuthResult(user: User): AuthResult {
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  /** Find auth by user id */
  async findAuthByUserId(userId: number): Promise<Auth> {
    const auth = await this.authRepository.findAuthByUserId(userId);

    if (!auth) {
      throw new BadRequestException(`We can find ${userId}.`);
    }

    return auth;
  }

  /** Validate refresh token and generate new access token */
  async refreshAccessToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    user?: User;
    message?: string;
  }> {
    try {
      // Validate refresh token
      const decodedToken: unknown = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      });

      // Validate token structure
      if (!isValidJwtPayload(decodedToken) || decodedToken.type !== 'refresh') {
        return {
          success: false,
          message: 'Invalid refresh token.',
        };
      }

      // Retrieve user information
      const user = await this.userService.findById(decodedToken.sub);
      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);

      return {
        success: true,
        accessToken: newAccessToken,
        user,
      };
    } catch {
      return {
        success: false,
        message: 'Invalid refresh token.',
      };
    }
  }

  // Handle provider-specific processing in AuthService
  async validateUser(provider: AuthProvider, userData: GoogleUser) {
    switch (provider) {
      case AuthProvider.GOOGLE:
        return this.validateGoogleUser(userData);
      // case AuthProvider.KAKAO:
      //   return this.validateKakaoUser(userData);
      // case AuthProvider.LOCAL:
      //   return this.validateLocalUser(userData);
      default:
        throw new BadRequestException('Unsupported login method.');
    }
  }

  // ===== User Management Methods =====

  /** Retrieve user by ID */
  async findUserById(userId: number): Promise<User | null> {
    return await this.userService.findById(userId);
  }

  // ===== Token Management Methods =====

  /** Generate JWT token pair (access + refresh) */
  generateTokenPair(user: User): TokenPair {
    // Generate access token (15 minutes)
    const accessToken = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access',
      },
      {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '15m',
      },
    );

    // Generate refresh token (7 days)
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }

  /** Generate access token */
  generateAccessToken(user: User): string {
    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access',
      },
      {
        secret: process.env.JWT_SECRET || 'jwt-secret-key',
        expiresIn: '15m', // 15분
      },
    );
  }

  // ===== Cookie Management Methods =====

  /** Set cookies */
  setAuthCookies(res: Response, tokens: TokenPair): void {
    const { accessToken, refreshToken } = tokens;

    // Send access token via HttpOnly cookie (enhanced security)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Send refresh token via HttpOnly cookie (enhanced security)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  /** Clear authentication cookies */
  clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }
}

// TODO: Add token blacklist management feature
// TODO: Multi-device login session management
// TODO: Expand social login providers (Kakao, Naver, etc.)
// TODO: Add account unlinking feature
// TODO: Refresh token rotation on token renewal
// TODO: Detect and notify abnormal login attempts
