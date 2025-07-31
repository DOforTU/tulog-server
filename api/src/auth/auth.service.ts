import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { Response } from 'express';
import { AuthProvider, Auth } from './auth.entity';
import { AuthRepository } from './auth.repository';
import { DataSource } from 'typeorm';
import * as nodemailer from 'nodemailer';
import { CreateOauthUserDto, UpdatePasswordDto } from 'src/user/user.dto';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';

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
    private dataSource: DataSource,
  ) {}

  // ===== Authentication and Validation Methods =====

  /** Google OAuth user validation and login processing */
  async validateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<AuthResult | undefined> {
    const { id: oauthId, email, firstName, lastName, picture } = googleUser;

    // 1. Check if user exists by email
    const user = await this.userService.findByEmail(email);
    let auth: Auth | null = null;

    // 1-1. If user does not exist, create one
    if (!user) {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Validate user data
        const userDto = plainToInstance(CreateOauthUserDto, {
          email,
          name: `${firstName} ${lastName}`.trim(),
          nickname: email.split('@')[0],
          profilePicture: picture,
          isActive: true,
        });

        await validateOrReject(userDto);

        // create new user
        const createdUser = await queryRunner.manager.save(User, userDto);

        // create auth record
        await queryRunner.manager.save(Auth, {
          oauthId,
          provider: AuthProvider.GOOGLE,
          user: createdUser,
        });

        // commit transaction
        await queryRunner.commitTransaction();
        return this.generateAuthResult(createdUser);
      } catch (error: any) {
        console.error('OAuth registration error:', error);
        // if error occurs, rollback transaction
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(
          'Failed Google OAuth registration',
        );
      } finally {
        // release(): return connection to pool
        await queryRunner.release();
      }
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


  async signup(dto: CreateLocalUserDto): Promise<boolean> {
    // 1. 이메일 인증코드 검증
    if (!this.emailCodeStore.has(dto.email)) {
      throw new NotFoundException('이메일 인증이 필요합니다.');
    }   
    
    // Check if user already exists
    const existingUser = await this.userService.findByEmail(dto.email);
    if (existingUser) {
      throw new Error('Email already exists.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // create new user
        const createdUser = await queryRunner.manager.save(User, {
          email: dto.email,
          password: hashedPassword,
          name: dto.name,
          nickname: dto.nickname,
        });

        // create auth record
        await queryRunner.manager.save(Auth, {
          provider: AuthProvider.LOCAL,
          user: createdUser,
        });

        // commit transaction
        await queryRunner.commitTransaction();

        // 인증코드 삭제
        this.emailCodeStore.delete(dto.email); 
        return true;

      } catch (error: any) {
        console.error('Local signup error:', error);
        // if error occurs, rollback transaction
        await queryRunner.rollbackTransaction();
        throw new InternalServerErrorException(
          'Failed Local OAuth registration',
        );
      } finally {
        // release(): return connection to pool
        await queryRunner.release();
      }
  }
  
  // ===== 로컬 이메일 인증코드 Methods =====
    /** 
   * Email code storage
  */
  private emailCodeStore = new Map<string, string>();
  /** 6자리 인증코드 생성 */
  private generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); 
  }

  /** 이메일로 인증코드 전송 (실제 서비스는 nodemailer 등 사용) */
  // npm install nodemailer 설치해야함
  async sendEmailCode(email: string): Promise<void> {
    const code = this.generateCode();
    this.emailCodeStore.set(email, code);
    
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_OAUTH_USER,
        pass: process.env.EMAIL_PASS,
      }
  });
  const mailOptions = {
    from: process.env.GMAIL_OAUTH_USER,
    to: email,
    subject: 'Tulog 회원가입 인증코드',
    text: `회원가입을 위한 인증코드입니다: ${code}`,
  };

  await transporter.sendMail(mailOptions);
}


  // ===== User Management Methods =====

  //** login user */ 


  /** Retrieve user by ID */
  async findUserById(userId: number): Promise<User | null> {
    return await this.userService.findById(userId);
  }

  /** Update user password */
  async updatePassword(
    userId: number,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    // Validate user existence
    const user = await this.userService.findWithPasswordById(userId);
    if (!user) {
      throw new BadRequestException(`User with ID ${userId} not found.`);
    }

    // check user's provider: if it's not local, throw an error
    const auth = await this.findAuthByUserId(userId);
    if (auth.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(
        'Password update is only allowed for local accounts.',
      );
    }

    // compare old password
    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Old password is incorrect.');
    }

    // password bcrypt hashing
    const hashedNewPassword: string = await bcrypt.hash(
      updatePasswordDto.newPassword,
      10,
    );

    // Update password
    const updatedUser = await this.userService.updatePassword(
      userId,
      hashedNewPassword,
    );

    return updatedUser;
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
