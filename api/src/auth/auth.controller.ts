import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, AuthResult } from './auth.service';
import { Response, Request } from 'express';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';

/** 쿠키 타입 정의 */
interface AuthCookies {
  accessToken?: string;
  refreshToken?: string;
  userInfo?: string;
}

/** 쿠키가 포함된 요청 인터페이스 */
interface RequestWithCookies extends Request {
  cookies: AuthCookies;
}

/** Google OAuth 인증된 요청 인터페이스 */
interface AuthenticatedRequest extends Request {
  user: AuthResult; // GoogleUser가 아니라 AuthResult를 받음
}

/**
 * 인증 관리 컨트롤러
 * - Google OAuth 로그인 처리
 * - JWT 토큰 관리
 * - 로그아웃 처리
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** Google OAuth 로그인 시작 */
  @Get('google')
  @UseGuards(AuthGuard('google'), RateLimitGuard)
  async googleAuth() {
    // Google OAuth 플로우를 시작하는 라우트
  }

  /** Google OAuth 콜백 처리 */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    // Google Strategy에서 이미 검증된 AuthResult를 그대로 사용
    const { user } = req.user;

    // 토큰 생성 및 쿠키 설정
    const tokens = this.authService.generateTokenPair(user);
    this.authService.setAuthCookies(res, user, tokens);

    // 프론트엔드로 리다이렉트 (토큰 없이, 성공 플래그만)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/login?success=true`);
  }

  /** 토큰 갱신 */
  @Post('refresh')
  @UseGuards(RateLimitGuard)
  async refreshToken(@Req() req: RequestWithCookies, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: '리프레시 토큰이 없습니다.',
      });
    }

    const result = await this.authService.refreshAccessToken(refreshToken);

    if (!result.success) {
      return res.status(401).json({
        success: false,
        message: result.message,
      });
    }

    // TODO: 새로운 액세스 토큰을 HttpOnly 쿠키에 다시 설정
    // TODO: 리프레시 토큰도 새로 발급하여 쿠키에 저장 (토큰 로테이션)

    return res.json({
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    });
  }

  /** 로그아웃 */
  @Post('logout')
  logout(@Res() res: Response) {
    // TODO: 토큰 블랙리스트 관리 - 로그아웃 시 토큰 무효화
    // 모든 인증 관련 쿠키 삭제
    this.authService.clearAuthCookies(res);

    return res.json({
      success: true,
      message: 'Logged out successfully',
    });
  }
}

// TODO: 카카오, 네이버 등 추가 소셜 로그인 제공자 구현
// TODO: 2FA (이중 인증) 기능 추가
// TODO: 세션 관리 및 다중 기기 로그인 제어
// TODO: API Rate Limiting 적용
// TODO: 로그인 시도 제한 및 보안 강화
