import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../../user/user.entity';

/**
 * ActiveUserGuard
 * - JWT 인증 + 계정 활성화 상태 확인
 * - isActive가 true인 사용자만 접근 허용
 * - 비활성화된 사용자에게는 이메일 인증 안내 메시지 제공
 */
@Injectable()
export class ActiveUserGuard extends JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 먼저 JWT 인증 확인
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // 사용자 정보 가져오기
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // 계정 활성화 상태 확인
    if (!user.isActive) {
      throw new ForbiddenException(
        '이메일 인증이 필요합니다. 마이페이지에서 이메일 인증을 완료해주세요.',
      );
    }

    return true;
  }
}
