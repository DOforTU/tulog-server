import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { User } from '../../user/user.entity';

/**
 * SmartAuthGuard
 * - JWT 인증 + 선택적 계정 활성화 상태 확인
 * - 기본적으로 isActive가 true인 사용자만 접근 허용
 * - @AllowInactiveUser() 데코레이터가 있으면 비활성화 사용자도 허용
 */
@Injectable()
export class SmartAuthGuard extends JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 먼저 JWT 인증 확인
    const isAuthenticated = await super.canActivate(context);
    if (!isAuthenticated) {
      return false;
    }

    // @AllowInactiveUser() 데코레이터 확인
    const allowInactiveUser = this.reflector.getAllAndOverride<boolean>(
      'allowInactiveUser',
      [context.getHandler(), context.getClass()],
    );

    // 비활성화 사용자 허용 설정이 있으면 바로 통과
    if (allowInactiveUser) {
      return true;
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
