import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { Response } from 'express';
import { AuthProvider, Auth } from './auth.entity';
import { AuthRepository } from './auth.repository';
import { DataSource } from 'typeorm';
import * as nodemailer from 'nodemailer';
import {
  CreateLocalUserDto,
  CreateOauthUserDto,
  LoginDto,
  UpdatePasswordDto,
} from 'src/user/user.dto';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { PendingUserRepository } from './pending-user.repository';

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
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly pendingUserRepository: PendingUserRepository,
    private dataSource: DataSource,
  ) {}

  // ===== Authentication and Validation Methods =====

  /** Google OAuth user validation and login processing */
  async validateGoogleUser(
    googleUser: GoogleUser,
  ): Promise<AuthResult | undefined> {
    const { id: oauthId, email, firstName, lastName, picture } = googleUser;

    // 1. Check if user exists by email
    const user = await this.userService.findUserByEmail(email);
    let auth: Auth | null = null;

    // 1-1. If user does not exist, create one
    if (!user) {
      const queryRunner = this.dataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const nickname = email.split('@')[0];

        // nickname valid
        let randomNickname = nickname;
        let attempt = 0;
        const MAX_ATTEMPTS = 5;

        while (attempt < MAX_ATTEMPTS) {
          const existing =
            await this.userService.findUserIncludingNoActiveByNickname(
              randomNickname,
            );
          if (!existing) break;

          const randomSuffix = Math.floor(Math.random() * 99999) + 1;
          randomNickname = `${nickname}${randomSuffix}`;
          attempt++;
        }

        if (attempt === MAX_ATTEMPTS) {
          throw new ConflictException(
            'Unable to generate a unique nickname after multiple attempts, Please try again later.',
          );
        }

        // Validate user data
        const userDto = plainToInstance(CreateOauthUserDto, {
          email,
          name: `${firstName} ${lastName}`.trim(),
          nickname: randomNickname,
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
    auth = await this.getAuthByUserId(user.id);

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
  async getAuthByUserId(userId: number): Promise<Auth> {
    const auth = await this.authRepository.findByUserId(userId);

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
      const user = await this.userService.findUserById(decodedToken.sub);
      if (!user) {
        return {
          success: false,
          message: 'User not found.',
        };
      }

      // TODO: Check if refresh token is blacklisted or expired

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

  async signup(dto: CreateLocalUserDto): Promise<{ email: string }> {
    // Check if user already exists
    const existingUser =
      await this.userService.findUserIncludingNoActiveByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists.');
    }

    // Check same nickname
    const existingUserNickname =
      await this.userService.findUserIncludingNoActiveByNickname(dto.nickname);
    if (existingUserNickname) {
      throw new ConflictException('Nickname already exists.');
    }

    // Check if there's already a pending registration for this email
    const existingPending = await this.pendingUserRepository.findByEmail(
      dto.email,
    );
    if (existingPending) {
      // Remove old pending registration
      await this.pendingUserRepository.remove(existingPending);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate verification code
    const verificationCode = this.generateCode();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

    // Save pending user data
    await this.pendingUserRepository.create({
      email: dto.email,
      password: hashedPassword,
      name: dto.name,
      nickname: dto.nickname,
      verificationCode,
      codeExpiresAt,
    });

    // Send verification email
    await this.sendSignupVerificationCode(dto.email, verificationCode);

    return { email: dto.email };
  }

  // ===== Local Email Verification Methods =====

  /** Send signup verification email */
  private async sendSignupVerificationCode(
    email: string,
    code: string,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_OAUTH_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL_OAUTH_USER,
      to: email,
      subject: 'Tulog 회원가입 인증코드',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>TULOG 회원가입 인증</h2>
          <p>안녕하세요! TULOG에 가입해주셔서 감사합니다.</p>
          <p>아래 인증코드를 입력하여 회원가입을 완료해주세요:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
            <h3 style="color: #333; font-size: 24px; margin: 0;">${code}</h3>
          </div>
          <p>인증코드는 10분간 유효합니다.</p>
          <p>감사합니다.<br>TULOG 팀</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(
        `Signup verification email sent to ${email} with code ${code}`,
      );
    } catch (error) {
      console.error('Failed to send signup verification email:', error);
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }
  }

  /**
   * Email code storage (기존 로그인 후 이메일 인증용)
   */
  private emailCodeStore = new Map<string, string>();
  /** code generation 6 digits */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /** Send email verification code (actual service should use nodemailer, etc.) */
  // npm install nodemailer
  async sendEmailCode(email: string): Promise<void> {
    const code = this.generateCode();
    this.emailCodeStore.set(email, code);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_OAUTH_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.GMAIL_OAUTH_USER,
      to: email,
      subject: 'Tulog 회원가입 인증코드',
      text: `That's the code for signup: ${code}`,
    };
    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${email} with code ${code}`);
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  }

  /** Verify email code and activate account */
  async verifyEmailCode(
    email: string,
    code: string,
  ): Promise<{ email: string }> {
    // Check stored verification code
    const storedCode = this.emailCodeStore.get(email);
    if (!storedCode) {
      throw new BadRequestException(
        'Verification code has expired or does not exist.',
      );
    }

    if (storedCode !== code) {
      throw new BadRequestException('Verification code does not match.');
    }

    // Find user
    const user = await this.userService.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    // Check if account is already activated
    if (user.isActive) {
      throw new BadRequestException('Account is already activated.');
    }

    // Activate account
    await this.userService.activateUser(user.id);

    // Delete verification code
    this.emailCodeStore.delete(email);

    return { email: user.email };
  }

  /** Complete signup after email verification */
  async completeSignup(
    email: string,
    code: string,
  ): Promise<{ email: string; message: string }> {
    // Find pending user
    const pendingUser = await this.pendingUserRepository.findByEmailAndCode(
      email,
      code,
    );

    if (!pendingUser) {
      throw new BadRequestException(
        'Invalid verification code or email address.',
      );
    }

    // Check if code is expired
    if (pendingUser.codeExpiresAt < new Date()) {
      // Remove expired pending user
      await this.pendingUserRepository.remove(pendingUser);
      throw new BadRequestException(
        'Verification code has expired. Please register again.',
      );
    }

    // Check if user already exists (double check)
    const existingUser =
      await this.userService.findUserIncludingNoActiveByEmail(email);
    if (existingUser) {
      // Remove pending user
      await this.pendingUserRepository.remove(pendingUser);
      throw new ConflictException('Email already exists.');
    }

    // Create actual user
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create new user with isActive: true
      const createdUser = await queryRunner.manager.save(User, {
        email: pendingUser.email,
        password: pendingUser.password,
        name: pendingUser.name,
        nickname: pendingUser.nickname,
        profilePicture: `${this.configService.get('USER_DEFAULT_AVATAR_URL')}`,
        isActive: true, // Activated from the start
      });

      // Create auth record
      await queryRunner.manager.save(Auth, {
        provider: AuthProvider.LOCAL,
        user: createdUser,
      });

      // Remove pending user data
      await this.pendingUserRepository.remove(pendingUser);

      // Commit transaction
      await queryRunner.commitTransaction();

      return {
        email: createdUser.email,
        message: 'Account created successfully!',
      };
    } catch (error: any) {
      console.error('Complete signup error:', error);
      // If error occurs, rollback transaction
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed to complete registration');
    } finally {
      // Release connection to pool
      await queryRunner.release();
    }
  }

  // ===== User Management Methods =====

  //** login user */
  async login(loginDto: LoginDto, res: Response): Promise<User> {
    try {
      // Check if user exists (with password for comparison)
      const user = await this.userService.findUserWithPasswordByEmail(
        loginDto.email,
      );
      if (!user) {
        throw new BadRequestException('User not found.');
      }

      // Check if auth exists
      const auth = await this.getAuthByUserId(user.id);

      if (auth.provider !== AuthProvider.LOCAL) {
        throw new BadRequestException(
          'Login is only allowed for local accounts.',
        );
      }

      // Check password (user.password should now be available)
      const isPasswordValid = await bcrypt.compare(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Invalid password.');
      }

      // Generate tokens and set cookies
      const tokens = this.generateTokenPair(user);
      this.setAuthCookies(res, tokens);

      return await this.userService.getUserByEmail(user.email);
    } catch (error: any) {
      console.error('Local login error:', error);
      if (error instanceof BadRequestException) {
        throw error; // 기존 에러 메시지 유지
      }
      throw new InternalServerErrorException('Failed Local login');
    }
  }

  /** Retrieve user by ID */
  async findUserById(userId: number): Promise<User | null> {
    return await this.userService.findUserById(userId);
  }

  /** Update user password */
  async updatePassword(
    user: User,
    updatePasswordDto: UpdatePasswordDto,
  ): Promise<User> {
    // check user's provider: if it's not local, throw an error
    const auth = await this.getAuthByUserId(user.id);
    if (auth.provider !== AuthProvider.LOCAL) {
      throw new BadRequestException(
        'Password update is only allowed for local accounts.',
      );
    }

    // Validate user existence and get user with password
    const userWithPW = await this.userService.findUserWithPasswordByEmail(
      user.email,
    );
    if (!userWithPW) {
      throw new BadRequestException(`User with email ${user.email} not found.`);
    }

    // compare old password
    const isPasswordValid = await bcrypt.compare(
      updatePasswordDto.oldPassword,
      userWithPW.password,
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
    await this.userService.updatePassword(user.id, hashedNewPassword);

    return user;
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
