# TULOG API Middleware Documentation

> TULOG API 서버의 미들웨어 시스템에 대한 상세한 설명서입니다.

## 목차

-   [개요](#개요)
-   [로깅 미들웨어](#로깅-미들웨어)
-   [보안 미들웨어](#보안-미들웨어)
-   [쿠키 파서 미들웨어](#쿠키-파서-미들웨어)
-   [미들웨어 실행 순서](#미들웨어-실행-순서)
-   [설정 및 적용](#설정-및-적용)

---

## 개요

미들웨어는 HTTP 요청이 라우트 핸들러에 도달하기 전에 실행되는 함수들입니다. TULOG API에서는 로깅, 보안, 쿠키 처리를 담당하는 미들웨어들을 구현하여 시스템의 안정성과 모니터링을 강화했습니다.

### 미들웨어 실행 흐름

```
HTTP Request → Security Middleware → Logging Middleware → Cookie Parser → Route Handler
```

---

## 로깅 미들웨어

### 위치

`src/common/middleware/logging.middleware.ts`

### 역할

-   HTTP 요청/응답 로깅
-   요청 처리 시간 측정
-   클라이언트 정보 기록

### 구현 세부사항

```typescript
@Injectable()
export class LoggingMiddleware implements NestMiddleware {
    private readonly logger = new Logger("HTTP");

    use(req: Request, res: Response, next: NextFunction): void {
        const { method, originalUrl, ip } = req;
        const userAgent = req.get("User-Agent") || "";
        const startTime = Date.now();

        // 요청 로깅
        this.logger.log(`${method} ${originalUrl} - ${ip} - ${userAgent.substring(0, 100)}`);

        // 응답 완료 시점에 로깅
        res.on("finish", () => {
            const { statusCode } = res;
            const contentLength = res.get("content-length");
            const responseTime = Date.now() - startTime;

            this.logger.log(`${method} ${originalUrl} ${statusCode} ${contentLength || 0}b - ${responseTime}ms`);
        });

        next();
    }
}
```

### 로그 형식

#### 요청 로그

```
[HTTP] GET /users/me - ::1 - Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
```

#### 응답 로그

```
[HTTP] GET /users/me 200 156b - 25ms
```

### 기능

1. **요청 정보 기록**

    - HTTP 메서드 (GET, POST, PUT, DELETE 등)
    - 요청 URL
    - 클라이언트 IP 주소
    - User-Agent (처음 100자만)

2. **응답 정보 기록**

    - HTTP 상태 코드
    - 응답 크기 (바이트)
    - 처리 시간 (밀리초)

3. **성능 모니터링**
    - 각 요청의 처리 시간 측정
    - 느린 요청 식별 가능

---

## 보안 미들웨어

### 위치

`src/common/middleware/security.middleware.ts`

### 역할

-   보안 헤더 설정
-   XSS, Clickjacking 등 웹 취약점 방어
-   HTTPS 강제 (프로덕션 환경)

### 구현 세부사항

```typescript
@Injectable()
export class SecurityMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction): void {
        // Security Headers 설정
        res.setHeader("X-Content-Type-Options", "nosniff");
        res.setHeader("X-Frame-Options", "DENY");
        res.setHeader("X-XSS-Protection", "1; mode=block");
        res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
        res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

        // 프로덕션 환경에서만 HTTPS 강제
        if (process.env.NODE_ENV === "production") {
            res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
        }

        next();
    }
}
```

### 설정되는 보안 헤더

| 헤더                        | 값                                         | 목적                    |
| --------------------------- | ------------------------------------------ | ----------------------- |
| `X-Content-Type-Options`    | `nosniff`                                  | MIME 타입 스니핑 방지   |
| `X-Frame-Options`           | `DENY`                                     | Clickjacking 공격 방지  |
| `X-XSS-Protection`          | `1; mode=block`                            | XSS 공격 차단           |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`          | Referrer 정보 제한      |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()` | 브라우저 권한 제한      |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains`      | HTTPS 강제 (프로덕션만) |

### 보안 효과

1. **XSS 방어**

    - 브라우저의 내장 XSS 필터 활성화
    - 악성 스크립트 실행 차단

2. **Clickjacking 방어**

    - iframe 내 페이지 로드 차단
    - UI 리드레싱 공격 방지

3. **MIME 스니핑 방지**

    - Content-Type 헤더 강제 준수
    - 파일 실행 공격 방지

4. **권한 제한**
    - 카메라, 마이크, 위치 접근 차단
    - 불필요한 브라우저 API 사용 제한

---

## 쿠키 파서 미들웨어

### 위치

`src/main.ts` (Express 미들웨어)

### 역할

-   HTTP 쿠키 파싱
-   JWT 토큰 추출을 위한 쿠키 처리
-   인증 시스템 지원

### 구현

```typescript
import cookieParser from "cookie-parser";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 쿠키 파서 미들웨어 추가
    app.use(cookieParser());

    // ... 기타 설정
}
```

### 기능

1. **쿠키 파싱**

    - 요청 헤더의 Cookie 값을 객체로 변환
    - `req.cookies` 객체로 접근 가능

2. **JWT 토큰 지원**

    - HttpOnly 쿠키에 저장된 JWT 토큰 추출
    - 인증 시스템과 연동

3. **보안 쿠키 처리**
    - Secure, HttpOnly, SameSite 속성 지원
    - CSRF 공격 방어

### 사용 예시

```typescript
// 컨트롤러에서 쿠키 접근
@Post('refresh')
async refreshToken(@Req() req: RequestWithCookies) {
  const refreshToken = req.cookies?.refreshToken; // 쿠키에서 토큰 추출
  // ...
}
```

---

## 미들웨어 실행 순서

TULOG API에서 미들웨어는 다음 순서로 실행됩니다:

```
1. Security Middleware    ← 보안 헤더 설정
2. Logging Middleware     ← 요청 로깅 시작
3. Cookie Parser          ← 쿠키 파싱
4. CORS Middleware        ← CORS 헤더 설정 (NestJS 내장)
5. Validation Pipe        ← 요청 데이터 검증
6. Route Handler          ← 실제 비즈니스 로직
7. Response Interceptor   ← 응답 형식 표준화
8. Exception Filter       ← 에러 처리
9. Logging Middleware     ← 응답 로깅 (finish 이벤트)
```

### 실행 순서가 중요한 이유

1. **보안 우선**: 보안 헤더를 가장 먼저 설정
2. **로깅 정확성**: 요청 시작 시점을 정확히 기록
3. **데이터 접근**: 쿠키 파싱 후 인증 정보 사용 가능
4. **에러 처리**: 모든 처리 과정의 에러를 캐치

---

## 설정 및 적용

### AppModule에서 미들웨어 등록

```typescript
@Module({
    // ... imports, controllers, providers
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(SecurityMiddleware, LoggingMiddleware).forRoutes("*");
    }
}
```

### main.ts에서 전역 설정

```typescript
async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 쿠키 파서
    app.use(cookieParser());

    // CORS 설정
    app.enableCors({
        origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
    });

    // 전역 파이프
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        })
    );

    await app.listen(process.env.PORT ?? 8000);
}
```

### 환경별 설정

#### 개발 환경

-   모든 로그 출력
-   HTTPS 강제 없음
-   상세한 에러 정보

#### 프로덕션 환경

-   필수 로그만 출력
-   HTTPS 강제 적용
-   보안 헤더 강화

---

## 모니터링 및 디버깅

### 로그 레벨 설정

```typescript
// 개발 환경: 모든 로그
const logger = new Logger("HTTP");

// 프로덕션 환경: 에러와 경고만
const logger = new Logger("HTTP");
logger.setLogLevels(["error", "warn"]);
```

### 성능 모니터링

로깅 미들웨어를 통해 다음을 모니터링할 수 있습니다:

1. **응답 시간 분석**

    - 평균 응답 시간
    - 느린 엔드포인트 식별

2. **트래픽 분석**

    - 요청 빈도
    - 인기 있는 엔드포인트

3. **에러 추적**
    - 4xx, 5xx 에러 발생 패턴
    - 클라이언트별 에러 분석

### 보안 이벤트 모니터링

1. **의심스러운 요청**

    - 비정상적으로 많은 요청
    - 악성 User-Agent

2. **보안 헤더 검증**
    - 브라우저에서 보안 헤더 적용 확인
    - CSP 위반 리포트 수집

---

## 추가 고려사항

### 성능 최적화

1. **로깅 오버헤드 최소화**

    - 비동기 로깅 사용
    - 로그 레벨 조정

2. **메모리 사용량 관리**
    - 로그 로테이션
    - 오래된 로그 자동 삭제

### 확장성

1. **추가 미들웨어**

    - Rate Limiting (구현됨)
    - Request ID 추가
    - API 키 검증

2. **외부 서비스 연동**
    - ELK Stack (로그 수집)
    - Sentry (에러 추적)
    - New Relic (성능 모니터링)

---

## 문제 해결

### 일반적인 문제

1. **CORS 에러**

    - origin 설정 확인
    - credentials 옵션 확인

2. **쿠키 접근 불가**

    - HttpOnly 설정 확인
    - SameSite 정책 확인

3. **보안 헤더 적용 안됨**
    - 미들웨어 실행 순서 확인
    - 프록시 설정 확인

### 디버깅 팁

1. **로그 확인**

    ```bash
    # 특정 엔드포인트 로그 필터링
    npm run start:dev | grep "GET /users"
    ```

2. **헤더 검증**

    ```bash
    # 응답 헤더 확인
    curl -I http://localhost:8000/api/health
    ```

3. **쿠키 디버깅**
    ```bash
    # 쿠키 포함 요청
    curl -b "accessToken=..." http://localhost:8000/users/me
    ```
