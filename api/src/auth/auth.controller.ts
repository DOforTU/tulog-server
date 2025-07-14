import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService, AuthResult } from './auth.service';
import { Response, Request } from 'express';

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
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Google OAuth 플로우를 시작하는 라우트
  }

  /** Google OAuth 콜백 처리 */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    // Google Strategy에서 이미 검증된 AuthResult를 그대로 사용
    const { accessToken, user } = req.user;

    // 프론트엔드 URL로 리다이렉트 (사용자 정보와 토큰 포함)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const userInfo = encodeURIComponent(JSON.stringify(user));
    res.redirect(`${frontendUrl}/login?token=${accessToken}&user=${userInfo}`);
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
    // 프론트엔드에서 토큰을 제거하므로 성공 응답만 반환
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}

// TODO: 리프레시 토큰 기능 구현
// TODO: 토큰 블랙리스트 관리 기능 추가
// TODO: 다중 기기 로그인 관리 기능
// TODO: 소셜 로그인 제공자 확장 (네이버, 카카오 등)
// TODO: 이메일 인증 로그인 기능 추가
