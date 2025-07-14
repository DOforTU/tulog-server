# TULOG API Guards Documentation

> TULOG API 서버의 가드 시스템에 대한 상세한 설명서입니다.

## 목차

-   [개요](#개요)
-   [JWT 인증 가드](#jwt-인증-가드)
-   [Rate Limit 가드](#rate-limit-가드)
-   [가드 실행 흐름](#가드-실행-흐름)
-   [설정 및 적용](#설정-및-적용)
-   [확장 및 커스터마이징](#확장-및-커스터마이징)
-   [보안 고려사항](#보안-고려사항)

---

## 개요

가드(Guards)는 NestJS의 인증 및 권한 부여를 담당하는 컴포넌트입니다. 요청이 라우트 핸들러에 도달하기 전에 실행되어 접근 권한을 검증합니다. TULOG API에서는 JWT 인증과 Rate Limiting을 위한 가드를 구현했습니다.

### 가드의 특징

1. **실행 시점**: 미들웨어 다음, 인터셉터 이전에 실행
2. **boolean 반환**: true면 허용, false면 차단
3. **예외 처리**: 차단 시 적절한 HTTP 예외 발생
4. **메타데이터 활용**: 데코레이터와 연동하여 동적 권한 검사

---

## JWT 인증 가드

### 위치

`src/auth/guards/jwt-auth.guard.ts`

### 역할

-   JWT 토큰 검증
-   사용자 인증 상태 확인
-   보호된 라우트 접근 제어

### 구현 세부사항

```typescript
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromCookie(request);

        if (!token) {
            throw new UnauthorizedException("Authentication token not found");
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });

            // 사용자 정보를 요청 객체에 추가
            request["user"] = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException("Invalid authentication token");
        }
    }

    private extractTokenFromCookie(request: Request): string | undefined {
        return request.cookies?.["access_token"];
    }
}
```

### JWT 가드 동작 원리

1. **토큰 추출**: HTTP-only 쿠키에서 JWT 토큰 추출
2. **토큰 검증**: JWT 서명 및 만료 시간 확인
3. **페이로드 해석**: 토큰에서 사용자 정보 추출
4. **요청 객체 확장**: 추출한 사용자 정보를 request.user에 저장
5. **접근 허용/차단**: 검증 성공 시 true, 실패 시 예외 발생

### 토큰 추출 전략

#### HTTP-only 쿠키 (권장)

```typescript
private extractTokenFromCookie(request: Request): string | undefined {
  return request.cookies?.['access_token'];
}
```

#### Authorization 헤더

```typescript
private extractTokenFromHeader(request: Request): string | undefined {
  const authHeader = request.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return undefined;
  return authHeader.split(' ')[1];
}
```

#### 다중 전략 지원

```typescript
private extractToken(request: Request): string | undefined {
  // 1순위: 쿠키
  let token = this.extractTokenFromCookie(request);

  // 2순위: Authorization 헤더
  if (!token) {
    token = this.extractTokenFromHeader(request);
  }

  return token;
}
```

---

## Rate Limit 가드

### 위치

`src/common/guards/rate-limit.guard.ts`

### 역할

-   API 호출 빈도 제한
-   DDoS 공격 방지
-   서버 리소스 보호

### 구현 세부사항

```typescript
import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Request } from "express";

interface RateLimitData {
    count: number;
    resetTime: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
    private readonly requests = new Map<string, RateLimitData>();
    private readonly limit = parseInt(process.env.RATE_LIMIT || "100", 10);
    private readonly windowMs = parseInt(process.env.RATE_WINDOW_MS || "900000", 10); // 15분

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const identifier = this.getClientIdentifier(request);

        const now = Date.now();
        const rateLimitData = this.requests.get(identifier);

        if (!rateLimitData || now > rateLimitData.resetTime) {
            // 새로운 윈도우 시작
            this.requests.set(identifier, {
                count: 1,
                resetTime: now + this.windowMs,
            });
            return true;
        }

        if (rateLimitData.count >= this.limit) {
            const resetTime = new Date(rateLimitData.resetTime);
            throw new HttpException(
                {
                    message: "Too many requests",
                    error: "Rate limit exceeded",
                    retryAfter: resetTime.toISOString(),
                },
                HttpStatus.TOO_MANY_REQUESTS
            );
        }

        // 요청 카운트 증가
        rateLimitData.count++;
        return true;
    }

    private getClientIdentifier(request: Request): string {
        // 인증된 사용자는 사용자 ID 사용
        if (request["user"]?.sub) {
            return `user:${request["user"].sub}`;
        }

        // 비인증 사용자는 IP 주소 사용
        const forwarded = request.headers["x-forwarded-for"] as string;
        const ip =
            forwarded?.split(",")[0].trim() ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.ip;

        return `ip:${ip}`;
    }
}
```

### Rate Limiting 전략

#### 고정 윈도우 (Fixed Window)

-   현재 구현 방식
-   특정 시간 윈도우 내에서 요청 수 제한
-   간단하지만 윈도우 경계에서 순간적 급증 가능

#### 슬라이딩 윈도우 (Sliding Window)

```typescript
@Injectable()
export class SlidingWindowRateLimitGuard implements CanActivate {
    private readonly requests = new Map<string, number[]>();

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const identifier = this.getClientIdentifier(request);
        const now = Date.now();

        let timestamps = this.requests.get(identifier) || [];

        // 윈도우 밖의 요청 제거
        timestamps = timestamps.filter((time) => now - time < this.windowMs);

        if (timestamps.length >= this.limit) {
            throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
        }

        timestamps.push(now);
        this.requests.set(identifier, timestamps);

        return true;
    }
}
```

#### 토큰 버킷 (Token Bucket)

```typescript
interface TokenBucket {
    tokens: number;
    lastRefill: number;
}

@Injectable()
export class TokenBucketRateLimitGuard implements CanActivate {
    private readonly buckets = new Map<string, TokenBucket>();
    private readonly capacity = 10; // 최대 토큰 수
    private readonly refillRate = 1; // 초당 토큰 생성 수

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const identifier = this.getClientIdentifier(request);
        const now = Date.now();

        let bucket = this.buckets.get(identifier);

        if (!bucket) {
            bucket = { tokens: this.capacity, lastRefill: now };
            this.buckets.set(identifier, bucket);
        }

        // 토큰 보충
        const elapsed = (now - bucket.lastRefill) / 1000;
        bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsed * this.refillRate);
        bucket.lastRefill = now;

        if (bucket.tokens < 1) {
            throw new HttpException("Rate limit exceeded", HttpStatus.TOO_MANY_REQUESTS);
        }

        bucket.tokens--;
        return true;
    }
}
```

---

## 가드 실행 흐름

```
Request → Middleware → Guards → Interceptors → Route Handler
```

### 상세 실행 단계

1. **요청 수신**: HTTP 요청이 서버에 도착
2. **미들웨어 실행**: 로깅, 보안 헤더, 쿠키 파싱 등
3. **가드 실행**: 인증 및 권한 검증
    - Rate Limit 가드 실행
    - JWT 인증 가드 실행
    - 커스텀 가드 실행
4. **인터셉터 실행**: 요청/응답 변환
5. **라우트 핸들러**: 실제 비즈니스 로직 실행

### 가드 실행 순서

```typescript
// 여러 가드 적용 시 실행 순서
@UseGuards(RateLimitGuard, JwtAuthGuard, RoleGuard)
@Controller("users")
export class UserController {
    // 1. RateLimitGuard
    // 2. JwtAuthGuard
    // 3. RoleGuard
    // 순서로 실행
}
```

### 조건부 가드 적용

```typescript
// 인증이 선택적인 엔드포인트
@Controller("posts")
export class PostController {
    @Get()
    @UseGuards(RateLimitGuard) // Rate Limit만 적용
    async findAll() {
        return this.postService.findAll();
    }

    @Post()
    @UseGuards(RateLimitGuard, JwtAuthGuard) // 둘 다 적용
    async create(@Body() createPostDto: CreatePostDto) {
        return this.postService.create(createPostDto);
    }
}
```

---

## 설정 및 적용

### 전역 가드 설정

```typescript
// main.ts
import { RateLimitGuard } from "./common/guards/rate-limit.guard";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 전역 Rate Limit 가드 설정
    app.useGlobalGuards(new RateLimitGuard());

    await app.listen(8000);
}
```

### 의존성 주입을 통한 전역 설정

```typescript
// app.module.ts
import { APP_GUARD } from "@nestjs/core";
import { RateLimitGuard } from "./common/guards/rate-limit.guard";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";

@Module({
    providers: [
        {
            provide: APP_GUARD,
            useClass: RateLimitGuard,
        },
        // JWT 가드는 선택적 적용을 위해 전역 설정하지 않음
    ],
})
export class AppModule {}
```

### 컨트롤러별 설정

```typescript
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RateLimitGuard } from "../common/guards/rate-limit.guard";

@Controller("users")
@UseGuards(RateLimitGuard) // 컨트롤러 전체에 적용
export class UserController {
    @Get("me")
    @UseGuards(JwtAuthGuard) // 특정 메서드에만 적용
    async getProfile(@Request() req) {
        return req.user;
    }

    @Get()
    async findAll() {
        // Rate Limit만 적용됨
        return this.userService.findAll();
    }
}
```

### 환경별 설정

```typescript
// config/guard.config.ts
export const guardConfig = {
    rateLimit: {
        limit: process.env.NODE_ENV === "production" ? 100 : 1000,
        windowMs: process.env.NODE_ENV === "production" ? 15 * 60 * 1000 : 60 * 1000,
    },
    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
    },
};
```

---

## 확장 및 커스터마이징

### 역할 기반 접근 제어 (RBAC)

```typescript
import { SetMetadata } from '@nestjs/common';

// 역할 데코레이터
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

// 역할 가드
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.some((role) => user?.roles?.includes(role));
  }
}

// 사용법
@Post()
@Roles('admin', 'moderator')
@UseGuards(JwtAuthGuard, RoleGuard)
async create(@Body() createDto: CreateDto) {
  return this.service.create(createDto);
}
```

### 권한 기반 접근 제어 (PBAC)

```typescript
export const Permissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'permissions',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredPermissions.every((permission) =>
      user?.permissions?.includes(permission),
    );
  }
}

// 사용법
@Delete(':id')
@Permissions('user:delete')
@UseGuards(JwtAuthGuard, PermissionGuard)
async remove(@Param('id') id: string) {
  return this.service.remove(id);
}
```

### IP 화이트리스트 가드

```typescript
@Injectable()
export class IPWhitelistGuard implements CanActivate {
    private readonly allowedIPs = process.env.ALLOWED_IPS?.split(",") || [];

    canActivate(context: ExecutionContext): boolean {
        if (this.allowedIPs.length === 0) {
            return true; // 화이트리스트가 비어있으면 모든 IP 허용
        }

        const request = context.switchToHttp().getRequest<Request>();
        const clientIP = this.getClientIP(request);

        const isAllowed = this.allowedIPs.some((allowedIP) => this.matchesIPPattern(clientIP, allowedIP));

        if (!isAllowed) {
            throw new ForbiddenException("Access denied from this IP address");
        }

        return true;
    }

    private getClientIP(request: Request): string {
        const forwarded = request.headers["x-forwarded-for"] as string;
        return (
            forwarded?.split(",")[0].trim() ||
            request.connection.remoteAddress ||
            request.socket.remoteAddress ||
            request.ip
        );
    }

    private matchesIPPattern(ip: string, pattern: string): boolean {
        if (pattern.includes("/")) {
            // CIDR 표기법 지원
            return this.matchesCIDR(ip, pattern);
        }
        if (pattern.includes("*")) {
            // 와일드카드 지원
            const regex = new RegExp(pattern.replace(/\*/g, ".*"));
            return regex.test(ip);
        }
        return ip === pattern;
    }
}
```

### 시간 기반 접근 제어

```typescript
@Injectable()
export class TimeBasedGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const now = new Date();
        const hour = now.getHours();

        // 업무 시간 (9-18시)에만 접근 허용
        const isBusinessHours = hour >= 9 && hour < 18;

        if (!isBusinessHours) {
            throw new ForbiddenException("Access denied outside business hours");
        }

        return true;
    }
}
```

---

## 보안 고려사항

### JWT 토큰 보안

1. **HTTP-only 쿠키 사용**

    ```typescript
    // XSS 공격 방지
    res.cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000, // 1시간
    });
    ```

2. **토큰 만료 시간 설정**

    ```typescript
    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload, {
        expiresIn: "1h", // 짧은 만료 시간
    });
    ```

3. **리프레시 토큰 구현**
    ```typescript
    @Injectable()
    export class RefreshTokenGuard implements CanActivate {
        async canActivate(context: ExecutionContext): Promise<boolean> {
            const request = context.switchToHttp().getRequest();
            const refreshToken = request.cookies?.["refresh_token"];

            if (!refreshToken) {
                throw new UnauthorizedException("Refresh token not found");
            }

            // 리프레시 토큰 검증 및 새 액세스 토큰 발급
            return true;
        }
    }
    ```

### Rate Limiting 보안

1. **분산 환경 대응**

    ```typescript
    import Redis from "ioredis";

    @Injectable()
    export class RedisRateLimitGuard implements CanActivate {
        constructor(private redis: Redis) {}

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const identifier = this.getClientIdentifier(request);
            const key = `rate_limit:${identifier}`;

            const current = await this.redis.incr(key);
            if (current === 1) {
                await this.redis.expire(key, this.windowMs / 1000);
            }

            if (current > this.limit) {
                throw new HttpException("Rate limit exceeded", 429);
            }

            return true;
        }
    }
    ```

2. **다단계 Rate Limiting**
    ```typescript
    @Injectable()
    export class MultiTierRateLimitGuard implements CanActivate {
        private readonly tiers = [
            { window: 1000, limit: 10 }, // 1초에 10개
            { window: 60000, limit: 100 }, // 1분에 100개
            { window: 3600000, limit: 1000 }, // 1시간에 1000개
        ];

        async canActivate(context: ExecutionContext): Promise<boolean> {
            const identifier = this.getClientIdentifier(request);

            for (const tier of this.tiers) {
                const allowed = await this.checkTier(identifier, tier);
                if (!allowed) {
                    throw new HttpException("Rate limit exceeded", 429);
                }
            }

            return true;
        }
    }
    ```

### 일반적인 보안 취약점 대응

1. **타이밍 공격 방지**

    ```typescript
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const start = Date.now();

      try {
        const isValid = await this.validateToken(token);
        return isValid;
      } catch (error) {
        // 항상 일정 시간 지연으로 타이밍 공격 방지
        const elapsed = Date.now() - start;
        const minDelay = 100; // 최소 100ms
        if (elapsed < minDelay) {
          await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
        }
        throw error;
      }
    }
    ```

2. **로그인 시도 제한**
    ```typescript
    @Injectable()
    export class LoginAttemptGuard implements CanActivate {
        private attempts = new Map<string, { count: number; blockedUntil?: number }>();

        canActivate(context: ExecutionContext): boolean {
            const request = context.switchToHttp().getRequest();
            const ip = this.getClientIP(request);
            const attempt = this.attempts.get(ip);

            if (attempt?.blockedUntil && Date.now() < attempt.blockedUntil) {
                throw new HttpException("Too many failed attempts", 429);
            }

            return true;
        }
    }
    ```

---

## 모니터링 및 디버깅

### 가드 실행 로깅

```typescript
@Injectable()
export class LoggingJwtAuthGuard extends JwtAuthGuard {
    private readonly logger = new Logger("JwtAuthGuard");

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        this.logger.log(`JWT auth check for ${request.method} ${request.url}`);

        try {
            const result = await super.canActivate(context);
            this.logger.log(`JWT auth ${result ? "success" : "failed"}`);
            return result;
        } catch (error) {
            this.logger.error(`JWT auth error: ${error.message}`);
            throw error;
        }
    }
}
```

### Rate Limit 메트릭

```typescript
@Injectable()
export class MetricsRateLimitGuard extends RateLimitGuard {
    private readonly metrics = {
        requests: 0,
        blocked: 0,
        reset: Date.now(),
    };

    canActivate(context: ExecutionContext): boolean {
        this.metrics.requests++;

        try {
            return super.canActivate(context);
        } catch (error) {
            this.metrics.blocked++;

            // 매 시간마다 메트릭 리셋
            if (Date.now() - this.metrics.reset > 3600000) {
                this.logMetrics();
                this.resetMetrics();
            }

            throw error;
        }
    }

    private logMetrics() {
        const blockRate = ((this.metrics.blocked / this.metrics.requests) * 100).toFixed(2);
        console.log(
            `Rate limit metrics: ${this.metrics.requests} requests, ${this.metrics.blocked} blocked (${blockRate}%)`
        );
    }
}
```

---

## 테스트

### JWT 가드 테스트

```typescript
describe("JwtAuthGuard", () => {
    let guard: JwtAuthGuard;
    let jwtService: JwtService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                {
                    provide: JwtService,
                    useValue: {
                        verifyAsync: jest.fn(),
                    },
                },
            ],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
        jwtService = module.get<JwtService>(JwtService);
    });

    it("should allow access with valid token", async () => {
        const mockExecutionContext = createMockExecutionContext({
            cookies: { access_token: "valid-token" },
        });

        jest.spyOn(jwtService, "verifyAsync").mockResolvedValue({ sub: 1 });

        const result = await guard.canActivate(mockExecutionContext);
        expect(result).toBe(true);
    });

    it("should deny access without token", async () => {
        const mockExecutionContext = createMockExecutionContext({
            cookies: {},
        });

        await expect(guard.canActivate(mockExecutionContext)).rejects.toThrow(UnauthorizedException);
    });
});
```

### Rate Limit 가드 테스트

```typescript
describe("RateLimitGuard", () => {
    let guard: RateLimitGuard;

    beforeEach(() => {
        guard = new RateLimitGuard();
    });

    it("should allow requests within limit", () => {
        const mockContext = createMockExecutionContext({
            ip: "127.0.0.1",
        });

        // 첫 번째 요청은 허용
        expect(guard.canActivate(mockContext)).toBe(true);
    });

    it("should block requests exceeding limit", () => {
        const mockContext = createMockExecutionContext({
            ip: "127.0.0.1",
        });

        // 제한을 초과하는 요청 생성
        for (let i = 0; i < 101; i++) {
            if (i < 100) {
                expect(guard.canActivate(mockContext)).toBe(true);
            } else {
                expect(() => guard.canActivate(mockContext)).toThrow(HttpException);
            }
        }
    });
});
```

---

## 성능 최적화

### 가드 실행 시간 최적화

```typescript
@Injectable()
export class OptimizedJwtAuthGuard implements CanActivate {
    private tokenCache = new Map<string, { payload: any; expiry: number }>();

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const token = this.extractToken(request);

        // 캐시된 토큰 확인
        const cached = this.tokenCache.get(token);
        if (cached && Date.now() < cached.expiry) {
            request["user"] = cached.payload;
            return true;
        }

        // 토큰 검증 및 캐싱
        const payload = await this.jwtService.verifyAsync(token);
        this.tokenCache.set(token, {
            payload,
            expiry: Date.now() + 60000, // 1분 캐싱
        });

        request["user"] = payload;
        return true;
    }
}
```

### 메모리 효율적인 Rate Limiting

```typescript
@Injectable()
export class EfficientRateLimitGuard implements CanActivate {
    private requests = new Map<string, number[]>();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // 5분마다 만료된 데이터 정리
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 5 * 60 * 1000);
    }

    private cleanup() {
        const now = Date.now();
        for (const [key, timestamps] of this.requests.entries()) {
            const validTimestamps = timestamps.filter((time) => now - time < this.windowMs);

            if (validTimestamps.length === 0) {
                this.requests.delete(key);
            } else {
                this.requests.set(key, validTimestamps);
            }
        }
    }

    onModuleDestroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}
```
