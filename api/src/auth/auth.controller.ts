import { Controller, Get, Post, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Response, Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: any;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // This route initiates the Google OAuth flow
  }

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

  @Post('refresh')
  refreshToken() {
    // TODO: Implement refresh token logic
    return { message: 'Refresh token endpoint' };
  }

  @Post('logout')
  logout() {
    // TODO: Implement logout logic (invalidate tokens)
    return { message: 'Logged out successfully' };
  }
}
