import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { AuthProvider, User } from '../user/user.entity';
import { Response } from 'express';

/** Google OAuth user information interface */
export interface GoogleUser {
  id: string;
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
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  // ===== Authentication and Validation Methods =====

  /** Google OAuth user validation and login processing */
  async validateGoogleUser(googleUser: GoogleUser): Promise<AuthResult> {
    const { id, email, firstName, lastName, picture } = googleUser;

    // Check if user exists with this Google ID (active users only)
    let user = await this.userService.findByGoogleId(id);

    if (!user) {
      // Check if active user exists with this email (might have signed up differently)
      const existingActiveUser = await this.userService.findByEmail(email);

      if (existingActiveUser) {
        // Link Google account to existing active user
        user = await this.userService.linkGoogleAccount(existingActiveUser.id, {
          googleId: id,
          profilePicture: picture,
        });
      } else {
        // Check for user by email including deleted users
        const existingUserIncludingDeleted =
          await this.userService.findByEmailIncludingDeleted(email);

        if (
          existingUserIncludingDeleted &&
          existingUserIncludingDeleted.isDeleted
        ) {
          // If deleted user exists, restore and update with new Google information
          user = await this.userService.restoreUser(
            existingUserIncludingDeleted.id,
          );
          user = await this.userService.linkGoogleAccount(user.id, {
            googleId: id,
            profilePicture: picture,
          });
          // Update username with current Google information
          user = await this.userService.updateUser(user.id, {
            username: `${firstName} ${lastName}`.trim(),
            nickname: email.split('@')[0],
          });
        } else {
          // Create new user with Google account
          user = await this.userService.createGoogleUser({
            googleId: id,
            email,
            username: `${firstName} ${lastName}`.trim(), // Real name as username
            nickname: email.split('@')[0], // Email prefix as nickname
            profilePicture: picture,
          });
        }
      }
    }

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
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
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-key',
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

    // Generate refresh token (30 days)
    const refreshToken = this.jwtService.sign(
      {
        sub: user.id,
        type: 'refresh',
      },
      {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        expiresIn: '30d',
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
        expiresIn: '15m',
      },
    );
  }

  // ===== Cookie Management Methods =====

  /** Set cookies */
  setAuthCookies(res: Response, user: User, tokens: TokenPair): void {
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
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    // Send only user information via cookie (without tokens)
    res.cookie('userInfo', JSON.stringify(user), {
      httpOnly: false, // Allow frontend to read
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  /** Clear authentication cookies */
  clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('userInfo');
  }
}

// TODO: Add token blacklist management feature
// TODO: Multi-device login session management
// TODO: Expand social login providers (Kakao, Naver, etc.)
// TODO: Add account unlinking feature
// TODO: Refresh token rotation on token renewal
// TODO: Detect and notify abnormal login attempts
