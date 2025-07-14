import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly store: RateLimitStore = {};
  private readonly windowMs = 15 * 60 * 1000; // 15분
  private readonly maxRequests = 100; // 15분당 최대 100회

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = this.getKey(request);
    const now = Date.now();

    // 기존 기록 확인
    const record = this.store[key];

    if (!record || now > record.resetTime) {
      // 새로운 윈도우 시작
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return true;
    }

    // 요청 수 증가
    record.count++;

    // 제한 초과 확인
    if (record.count > this.maxRequests) {
      throw new HttpException(
        {
          success: false,
          message: 'Too many requests. Please try again later.',
          retryAfter: Math.ceil((record.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private getKey(request: Request): string {
    // IP 주소를 기반으로 키 생성
    return request.ip || request.connection.remoteAddress || 'unknown';
  }

  // 메모리 정리를 위한 주기적 클린업 (실제 운영환경에서는 Redis 등 사용 권장)
  cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach((key) => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}
