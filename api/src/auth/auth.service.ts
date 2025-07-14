import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { User } from '../user/user.entity';
import { Response } from 'express';

/** Google OAuth 사용자 정보 인터페이스 */
export interface GoogleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
}

/** 인증 결과 인터페이스 */
export interface AuthResult {
  accessToken: string;
  user: User;
}

/** JWT 페이로드 타입 정의 */
export interface JwtPayload {
  sub: number;
  email?: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
}

/** 토큰 생성 결과 인터페이스 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

/** JWT 페이로드 타입 가드 */
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
 * 인증 서비스
 * - Google OAuth 사용자 검증 및 처리
 * - JWT 토큰 생성
 * - 사용자 계정 연동 및 생성
 */
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  /** Google OAuth 사용자 검증 및 로그인 처리 */
  async validateGoogleUser(googleUser: GoogleUser): Promise<AuthResult> {
    const { id, email, firstName, lastName, picture } = googleUser;

    // 이 Google ID로 사용자가 존재하는지 확인 (활성 사용자만)
    let user = await this.userService.findByGoogleId(id);

    if (!user) {
      // 이 이메일로 활성 사용자가 존재하는지 확인 (다른 방법으로 가입했을 수 있음)
      const existingActiveUser = await this.userService.findByEmail(email);

      if (existingActiveUser) {
        // 기존 활성 사용자에 Google 계정 연동
        user = await this.userService.linkGoogleAccount(existingActiveUser.id, {
          googleId: id,
          profilePicture: picture,
        });
      } else {
        // 삭제된 사용자를 포함하여 이메일로 사용자 확인
        const existingUserIncludingDeleted =
          await this.userService.findByEmailIncludingDeleted(email);

        if (
          existingUserIncludingDeleted &&
          existingUserIncludingDeleted.isDeleted
        ) {
          // 삭제된 사용자가 있으면 복구하고 새 Google 정보로 업데이트
          user = await this.userService.restoreUser(
            existingUserIncludingDeleted.id,
          );
          user = await this.userService.linkGoogleAccount(user.id, {
            googleId: id,
            profilePicture: picture,
          });
          // 현재 Google 정보로 사용자명 업데이트
          user = await this.userService.updateUser(user.id, {
            username: `${firstName} ${lastName}`.trim(),
            nickname: email.split('@')[0],
          });
        } else {
          // Google 계정으로 새 사용자 생성
          user = await this.userService.createGoogleUser({
            googleId: id,
            email,
            username: `${firstName} ${lastName}`.trim(), // 실제 이름을 username에
            nickname: email.split('@')[0], // 이메일 앞부분을 nickname에
            profilePicture: picture,
          });
        }
      }
    }

    // JWT 토큰 생성
    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user,
    };
  }

  /** ID로 사용자 조회 */
  async findUserById(userId: number): Promise<User | null> {
    return await this.userService.findById(userId);
  }

  /** JWT 토큰 쌍 생성 (액세스 + 리프레시) */
  generateTokenPair(user: User): TokenPair {
    // 액세스 토큰 생성 (15분)
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

    // 리프레시 토큰 생성 (30일)
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

  /** 액세스 토큰 생성 */
  generateAccessToken(user: User): string {
    return this.jwtService.sign(
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
  }

  /** 쿠키 설정 */
  setAuthCookies(res: Response, user: User, tokens: TokenPair): void {
    const { accessToken, refreshToken } = tokens;

    // HttpOnly 쿠키로 액세스 토큰 전달 (보안 강화)
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15분
    });

    // HttpOnly 쿠키로 리프레시 토큰 전달 (보안 강화)
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
    });

    // 사용자 정보만 쿠키로 전달 (토큰 없이)
    res.cookie('userInfo', JSON.stringify(user), {
      httpOnly: false, // 프론트엔드에서 읽을 수 있도록
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30일
    });
  }

  /** 리프레시 토큰 검증 및 새 액세스 토큰 생성 */
  async refreshAccessToken(refreshToken: string): Promise<{
    success: boolean;
    accessToken?: string;
    user?: User;
    message?: string;
  }> {
    try {
      // 리프레시 토큰 검증
      const decodedToken: unknown = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
      });

      // 토큰 구조 검증
      if (!isValidJwtPayload(decodedToken) || decodedToken.type !== 'refresh') {
        return {
          success: false,
          message: '유효하지 않은 리프레시 토큰입니다.',
        };
      }

      // 사용자 정보 조회
      const user = await this.userService.findById(decodedToken.sub);
      if (!user) {
        return {
          success: false,
          message: '사용자를 찾을 수 없습니다.',
        };
      }

      // 새 액세스 토큰 생성
      const newAccessToken = this.generateAccessToken(user);

      return {
        success: true,
        accessToken: newAccessToken,
        user,
      };
    } catch {
      return {
        success: false,
        message: '유효하지 않은 리프레시 토큰입니다.',
      };
    }
  }

  /** 인증 쿠키 삭제 */
  clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('userInfo');
  }
}

// TODO: 토큰 블랙리스트 관리 기능 추가
// TODO: 다중 기기 로그인 세션 관리
// TODO: 소셜 로그인 제공자 확장 (카카오, 네이버 등)
// TODO: 계정 연동 해제 기능 추가
// TODO: 토큰 갱신 시 리프레시 토큰 로테이션
// TODO: 비정상적인 로그인 시도 감지 및 알림
