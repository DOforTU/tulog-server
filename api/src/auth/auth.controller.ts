import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

/** Google OAuth 인증된 요청 인터페이스 */
interface AuthenticatedRequest extends Request {
  user: any;
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
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google OAuth 플로우를 시작하는 라우트
  }

  /** Google OAuth 콜백 처리 */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const { accessToken } = await this.authService.validateGoogleUser(req.user);

    // 개발 환경에서는 같은 서버의 루트로 리다이렉트
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8000';
    res.redirect(`${frontendUrl}/?token=${accessToken}`);
  }

  /** 토큰 갱신 */
  @Post('refresh')
  refreshToken() {
    // TODO: 리프레시 토큰 로직 구현
    return { message: 'Refresh token endpoint' };
  }

  /** 로그아웃 */
  @Post('logout')
  logout() {
    // TODO: 로그아웃 로직 구현 (토큰 무효화)
    return { message: 'Logged out successfully' };
  }
}

// TODO: 리프레시 토큰 기능 구현
// TODO: 토큰 블랙리스트 관리 기능 추가
// TODO: 다중 기기 로그인 관리 기능
// TODO: 소셜 로그인 제공자 확장 (네이버, 카카오 등)
// TODO: 이메일 인증 로그인 기능 추가
