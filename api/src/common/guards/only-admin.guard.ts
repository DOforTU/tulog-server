import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { User, UserRole } from '../../user/user.entity';
import { SmartAuthGuard } from 'src/auth/jwt';

/**
 * AdminGuard
 * - JWT 인증 + 활성화 + 관리자 권한 확인
 * - ADMIN 또는 SUPER_ADMIN만 접근 가능
 */
@Injectable()
export class AdminGuard extends SmartAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 먼저 SmartAuthGuard 통과 (JWT + isActive 검사)
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    // 관리자 권한 확인
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      throw new ForbiddenException('관리자 권한이 필요합니다.');
    }

    return true;
  }
}
