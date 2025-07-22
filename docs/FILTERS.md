# TULOG API Filters Documentation

> Detailed documentation for the exception filter system of TULOG API server.

## Table of Contents

-   [Overview](#overview)
-   [Global Exception Filter](#global-exception-filter)
-   [Exception Handling Flow](#exception-handling-flow)
-   [Error Response Format](#error-response-format)
-   [Logging and Monitoring](#logging-and-monitoring)
-   [Custom Exception Handling](#custom-exception-handling)
-   [Security Considerations](#security-considerations)

---

## Overview

Exception Filters are NestJS's last line of defense that handle all exceptions occurring in the application. Exception filters catch unhandled exceptions and transform them into appropriate responses to send to clients. TULOG API implements a global exception filter for consistent error response format and systematic logging.

### Exception Filter Characteristics

1. **Last Execution**: Executed after all other components
2. **Exception Transformation**: Convert exceptions to HTTP responses
3. **Error Logging**: System error tracking and debugging
4. **Security Enhancement**: Prevent sensitive information exposure

---

## Global Exception Filter

### Location

`src/common/filters/all-exceptions.filter.ts`

### Role

-   Unified handling of all exceptions
-   Provide consistent error response format
-   Systematic error logging
-   Protect sensitive information

### Implementation Details

```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger("ExceptionFilter");

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const { status, message, error } = this.getErrorInfo(exception);

        const errorResponse = {
            success: false,
            error: {
                message,
                error,
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
            },
        };

        // 로깅
        this.logException(exception, request, status);

        response.status(status).json(errorResponse);
    }

    private getErrorInfo(exception: unknown): {
        status: number;
        message: string;
        error: string;
    } {
        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const response = exception.getResponse();

            if (typeof response === "string") {
                return {
                    status,
                    message: response,
                    error: HttpStatus[status] || "Unknown Error",
                };
            }

            if (typeof response === "object" && response !== null) {
                return {
                    status,
                    message: (response as any).message || "An error occurred",
                    error: (response as any).error || HttpStatus[status] || "Unknown Error",
                };
            }
        }

        // 일반 Error 객체
        if (exception instanceof Error) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: process.env.NODE_ENV === "production" ? "Internal server error" : exception.message,
                error: "Internal Server Error",
            };
        }

        // 알 수 없는 예외
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: "An unexpected error occurred",
            error: "Internal Server Error",
        };
    }

    private logException(exception: unknown, request: Request, status: number): void {
        const errorInfo = {
            method: request.method,
            url: request.url,
            userAgent: request.get("User-Agent") || "",
            ip: request.ip,
            status,
            timestamp: new Date().toISOString(),
        };

        if (status >= 500) {
            // 서버 에러는 error 레벨로 로깅
            this.logger.error(
                `${exception}`,
                exception instanceof Error ? exception.stack : undefined,
                `${request.method} ${request.url}`
            );
        } else {
            // 클라이언트 에러는 warn 레벨로 로깅
            this.logger.warn(`Client error: ${status} - ${request.method} ${request.url}`, errorInfo);
        }
    }
}
```

---

## 예외 처리 흐름

```
Request → Middleware → Guards → Interceptors → Route Handler → Exception Filter → Response
```

### 상세 처리 단계

1. **예외 발생**: 애플리케이션 어디서든 예외 발생
2. **예외 캐치**: `@Catch()` 데코레이터로 모든 예외 포착
3. **컨텍스트 추출**: ArgumentsHost에서 HTTP 컨텍스트 획득
4. **에러 정보 추출**: 예외 타입별로 적절한 정보 추출
5. **응답 형식 생성**: 표준화된 에러 응답 객체 생성
6. **로깅 수행**: 에러 레벨에 따른 차등 로깅
7. **응답 전송**: 클라이언트에게 에러 응답 전송

### 예외 타입별 처리

#### HTTP 예외 (HttpException)

```typescript
// NestJS 표준 HTTP 예외
throw new BadRequestException("Invalid user data");
throw new UnauthorizedException("Authentication required");
throw new ForbiddenException("Access denied");
throw new NotFoundException("User not found");
```

#### 비즈니스 로직 예외

```typescript
// 커스텀 비즈니스 예외
throw new ConflictException("Email already exists");
throw new UnprocessableEntityException("Invalid email format");
```

#### 시스템 예외 (Error)

```typescript
// 일반 JavaScript 에러
throw new Error("Database connection failed");
throw new TypeError("Invalid parameter type");
```

#### 알 수 없는 예외

```typescript
// 예상치 못한 예외 (string, null 등)
throw "Something went wrong";
throw null;
```

---

## 에러 응답 형식

### 표준 에러 응답 구조

```typescript
interface ErrorResponse {
    success: false;
    error: {
        message: string; // 사용자 친화적 에러 메시지
        error: string; // HTTP 상태명 (예: 'Bad Request')
        statusCode: number; // HTTP 상태 코드
        timestamp: string; // 에러 발생 시간 (ISO 8601)
        path: string; // 요청 경로
        method: string; // HTTP 메서드
    };
}
```

### 상태별 응답 예시

#### 400 Bad Request

```json
{
    "success": false,
    "error": {
        "message": "Validation failed",
        "error": "Bad Request",
        "statusCode": 400,
        "timestamp": "2025-07-15T03:45:30.123Z",
        "path": "/users",
        "method": "POST"
    }
}
```

#### 401 Unauthorized

```json
{
    "success": false,
    "error": {
        "message": "Authentication token not found",
        "error": "Unauthorized",
        "statusCode": 401,
        "timestamp": "2025-07-15T03:45:30.123Z",
        "path": "/users/me",
        "method": "GET"
    }
}
```

#### 404 Not Found

```json
{
    "success": false,
    "error": {
        "message": "User not found",
        "error": "Not Found",
        "statusCode": 404,
        "timestamp": "2025-07-15T03:45:30.123Z",
        "path": "/users/999",
        "method": "GET"
    }
}
```

#### 500 Internal Server Error

```json
{
    "success": false,
    "error": {
        "message": "Internal server error",
        "error": "Internal Server Error",
        "statusCode": 500,
        "timestamp": "2025-07-15T03:45:30.123Z",
        "path": "/users",
        "method": "GET"
    }
}
```

### 개발 환경 vs 프로덕션 환경

#### 개발 환경 (상세한 에러 정보)

```json
{
    "success": false,
    "error": {
        "message": "Cannot read property 'id' of undefined",
        "error": "Internal Server Error",
        "statusCode": 500,
        "timestamp": "2025-07-15T03:45:30.123Z",
        "path": "/users/me",
        "method": "GET",
        "stack": "TypeError: Cannot read property 'id' of undefined\n    at UserService.findById..."
    }
}
```

#### 프로덕션 환경 (보안을 위한 일반적 메시지)

```json
{
    "success": false,
    "error": {
        "message": "Internal server error",
        "error": "Internal Server Error",
        "statusCode": 500,
        "timestamp": "2025-07-15T03:45:30.123Z",
        "path": "/users/me",
        "method": "GET"
    }
}
```

---

## 로깅 및 모니터링

### 에러 레벨별 로깅 전략

#### 클라이언트 에러 (4xx) - WARN 레벨

```typescript
private logClientError(exception: HttpException, request: Request): void {
  const context = {
    method: request.method,
    url: request.url,
    statusCode: exception.getStatus(),
    userAgent: request.get('User-Agent'),
    ip: request.ip,
    timestamp: new Date().toISOString(),
  };

  this.logger.warn(`Client error: ${exception.message}`, context);
}
```

#### 서버 에러 (5xx) - ERROR 레벨

```typescript
private logServerError(exception: Error, request: Request): void {
  const context = {
    method: request.method,
    url: request.url,
    userAgent: request.get('User-Agent'),
    ip: request.ip,
    timestamp: new Date().toISOString(),
  };

  this.logger.error(
    `Server error: ${exception.message}`,
    exception.stack,
    context,
  );
}
```

### 구조화된 로깅

```typescript
@Catch()
export class StructuredLoggingFilter implements ExceptionFilter {
    private readonly logger = new Logger("ExceptionFilter");

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const errorLog = {
            timestamp: new Date().toISOString(),
            level: this.getLogLevel(exception),
            message: this.getErrorMessage(exception),
            context: {
                method: request.method,
                url: request.url,
                userAgent: request.get("User-Agent"),
                ip: request.ip,
                userId: request["user"]?.sub, // 인증된 사용자 ID
            },
            exception: {
                name: exception?.constructor?.name,
                message: exception instanceof Error ? exception.message : String(exception),
                stack: exception instanceof Error ? exception.stack : undefined,
            },
        };

        // 구조화된 JSON 로그 출력
        this.logger.log(JSON.stringify(errorLog));

        // HTTP 응답 생성
        const errorResponse = this.createErrorResponse(exception, request);
        response.status(errorResponse.error.statusCode).json(errorResponse);
    }
}
```

### 외부 모니터링 도구 연동

#### Sentry 연동

```typescript
import * as Sentry from "@sentry/node";

@Catch()
export class SentryExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        // Sentry에 에러 전송
        if (this.shouldReportToSentry(exception)) {
            Sentry.captureException(exception, {
                contexts: {
                    http: {
                        method: request.method,
                        url: request.url,
                        user_agent: request.get("User-Agent"),
                    },
                },
                user: {
                    id: request["user"]?.sub,
                    ip_address: request.ip,
                },
                tags: {
                    component: "exception-filter",
                },
            });
        }

        // 일반 예외 처리 로직 실행
        this.handleException(exception, host);
    }

    private shouldReportToSentry(exception: unknown): boolean {
        // 서버 에러만 Sentry에 보고
        if (exception instanceof HttpException) {
            return exception.getStatus() >= 500;
        }
        return true;
    }
}
```

#### 슬랙 알림 연동

```typescript
@Catch()
export class SlackNotificationFilter implements ExceptionFilter {
    private readonly webhookUrl = process.env.SLACK_WEBHOOK_URL;

    catch(exception: unknown, host: ArgumentsHost): void {
        // 심각한 에러만 슬랙 알림
        if (this.isCriticalError(exception)) {
            this.sendSlackNotification(exception, host);
        }

        // 일반 예외 처리
        this.handleException(exception, host);
    }

    private async sendSlackNotification(exception: unknown, host: ArgumentsHost): Promise<void> {
        const request = host.switchToHttp().getRequest<Request>();

        const message = {
            text: `🚨 Critical Error Detected`,
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Error:* ${exception instanceof Error ? exception.message : "Unknown error"}`,
                    },
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: `*Path:* ${request.method} ${request.url}\n*Time:* ${new Date().toISOString()}`,
                    },
                },
            ],
        };

        try {
            await fetch(this.webhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(message),
            });
        } catch (error) {
            console.error("Failed to send Slack notification:", error);
        }
    }
}
```

---

## 커스텀 예외 처리

### 비즈니스 로직 예외

```typescript
// 커스텀 예외 클래스
export class UserAlreadyExistsException extends ConflictException {
    constructor(email: string) {
        super(`User with email ${email} already exists`);
    }
}

export class InvalidPasswordException extends BadRequestException {
    constructor() {
        super("Password must be at least 8 characters long");
    }
}

// 사용법
@Injectable()
export class UserService {
    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.findByEmail(createUserDto.email);
        if (existingUser) {
            throw new UserAlreadyExistsException(createUserDto.email);
        }

        if (createUserDto.password.length < 8) {
            throw new InvalidPasswordException();
        }

        return this.userRepository.save(createUserDto);
    }
}
```

### 유효성 검증 예외

```typescript
import { ValidationError } from "class-validator";

@Catch(ValidationError)
export class ValidationExceptionFilter implements ExceptionFilter {
    catch(exception: ValidationError[], host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const errors = this.formatValidationErrors(exception);

        const errorResponse = {
            success: false,
            error: {
                message: "Validation failed",
                error: "Bad Request",
                statusCode: 400,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
                details: errors,
            },
        };

        response.status(400).json(errorResponse);
    }

    private formatValidationErrors(errors: ValidationError[]): any {
        return errors.reduce((acc, error) => {
            acc[error.property] = Object.values(error.constraints || {});
            return acc;
        }, {});
    }
}
```

### 데이터베이스 예외

```typescript
@Catch(QueryFailedError)
export class DatabaseExceptionFilter implements ExceptionFilter {
    catch(exception: QueryFailedError, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const { status, message } = this.mapDatabaseError(exception);

        const errorResponse = {
            success: false,
            error: {
                message,
                error: HttpStatus[status],
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
            },
        };

        response.status(status).json(errorResponse);
    }

    private mapDatabaseError(error: QueryFailedError): { status: number; message: string } {
        const errorCode = (error as any).code;

        switch (errorCode) {
            case "23505": // unique_violation
                return {
                    status: HttpStatus.CONFLICT,
                    message: "Resource already exists",
                };
            case "23503": // foreign_key_violation
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Referenced resource does not exist",
                };
            case "23502": // not_null_violation
                return {
                    status: HttpStatus.BAD_REQUEST,
                    message: "Required field is missing",
                };
            default:
                return {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    message: "Database error occurred",
                };
        }
    }
}
```

---

## 보안 고려사항

### 정보 누출 방지

```typescript
@Catch()
export class SecureExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger("ExceptionFilter");

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const { status, message, error } = this.getSecureErrorInfo(exception);

        const errorResponse = {
            success: false,
            error: {
                message: this.sanitizeMessage(message),
                error,
                statusCode: status,
                timestamp: new Date().toISOString(),
                path: request.url,
                method: request.method,
            },
        };

        response.status(status).json(errorResponse);
    }

    private sanitizeMessage(message: string): string {
        // 민감한 정보 패턴 제거
        const sensitivePatterns = [
            /password\s*[:=]\s*\S+/gi,
            /token\s*[:=]\s*\S+/gi,
            /key\s*[:=]\s*\S+/gi,
            /secret\s*[:=]\s*\S+/gi,
            /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, // 신용카드 번호
            /\b\d{3}-\d{2}-\d{4}\b/g, // SSN 패턴
        ];

        let sanitized = message;
        sensitivePatterns.forEach((pattern) => {
            sanitized = sanitized.replace(pattern, "[REDACTED]");
        });

        return sanitized;
    }

    private getSecureErrorInfo(exception: unknown): {
        status: number;
        message: string;
        error: string;
    } {
        if (exception instanceof HttpException) {
            return {
                status: exception.getStatus(),
                message: exception.message,
                error: HttpStatus[exception.getStatus()] || "Unknown Error",
            };
        }

        // 프로덕션에서는 내부 에러 정보 숨김
        if (process.env.NODE_ENV === "production") {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "An error occurred while processing your request",
                error: "Internal Server Error",
            };
        }

        // 개발 환경에서는 상세 정보 제공
        return {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            message: exception instanceof Error ? exception.message : "Unknown error",
            error: "Internal Server Error",
        };
    }
}
```

### Rate Limiting 에러 처리

```typescript
@Catch(HttpException)
export class RateLimitExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        if (exception.getStatus() === HttpStatus.TOO_MANY_REQUESTS) {
            const errorResponse = {
                success: false,
                error: {
                    message: "Too many requests",
                    error: "Too Many Requests",
                    statusCode: 429,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                    method: request.method,
                    retryAfter: this.getRetryAfter(exception),
                },
            };

            // Retry-After 헤더 설정
            response.set("Retry-After", "900"); // 15분
            response.status(429).json(errorResponse);
            return;
        }

        // 다른 HTTP 예외는 기본 처리
        this.handleOtherHttpExceptions(exception, host);
    }

    private getRetryAfter(exception: HttpException): string {
        const response = exception.getResponse();
        if (typeof response === "object" && response !== null) {
            return (response as any).retryAfter || "900";
        }
        return "900";
    }
}
```

---

## 설정 및 적용

### 전역 필터 등록

```typescript
// main.ts
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 전역 예외 필터 설정
    app.useGlobalFilters(new AllExceptionsFilter());

    await app.listen(8000);
}
```

### 의존성 주입을 통한 등록

```typescript
// app.module.ts
import { APP_FILTER } from "@nestjs/core";
import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter";

@Module({
    providers: [
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
})
export class AppModule {}
```

### 계층별 필터 적용

```typescript
// 컨트롤러별 필터
@Controller("users")
@UseFilters(ValidationExceptionFilter)
export class UserController {
    @Post()
    @UseFilters(DatabaseExceptionFilter) // 메서드별 필터
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }
}
```

---

## 테스트

### 예외 필터 단위 테스트

```typescript
describe("AllExceptionsFilter", () => {
    let filter: AllExceptionsFilter;
    let mockArgumentsHost: ArgumentsHost;
    let mockResponse: Response;
    let mockRequest: Request;

    beforeEach(() => {
        filter = new AllExceptionsFilter();

        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        } as any;

        mockRequest = {
            url: "/test",
            method: "GET",
            ip: "127.0.0.1",
        } as any;

        mockArgumentsHost = {
            switchToHttp: () => ({
                getResponse: () => mockResponse,
                getRequest: () => mockRequest,
            }),
        } as any;
    });

    it("should handle HttpException correctly", () => {
        const exception = new BadRequestException("Test error");

        filter.catch(exception, mockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(400);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: {
                message: "Test error",
                error: "Bad Request",
                statusCode: 400,
                timestamp: expect.any(String),
                path: "/test",
                method: "GET",
            },
        });
    });

    it("should handle unknown exceptions", () => {
        const exception = new Error("Unknown error");

        filter.catch(exception, mockArgumentsHost);

        expect(mockResponse.status).toHaveBeenCalledWith(500);
        expect(mockResponse.json).toHaveBeenCalledWith({
            success: false,
            error: {
                message: expect.any(String),
                error: "Internal Server Error",
                statusCode: 500,
                timestamp: expect.any(String),
                path: "/test",
                method: "GET",
            },
        });
    });
});
```

### E2E 테스트

```typescript
describe("Exception Handling (e2e)", () => {
    it("should return standardized error response", () => {
        return request(app.getHttpServer())
            .get("/users/invalid-id")
            .expect(404)
            .expect((res) => {
                expect(res.body.success).toBe(false);
                expect(res.body.error.statusCode).toBe(404);
                expect(res.body.error.timestamp).toBeDefined();
                expect(res.body.error.path).toBe("/users/invalid-id");
            });
    });

    it("should handle validation errors", () => {
        return request(app.getHttpServer())
            .post("/users")
            .send({
                /* invalid data */
            })
            .expect(400)
            .expect((res) => {
                expect(res.body.success).toBe(false);
                expect(res.body.error.message).toContain("Validation failed");
            });
    });
});
```

---

## 성능 최적화

### 에러 로깅 최적화

```typescript
@Catch()
export class OptimizedExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger("ExceptionFilter");
    private logQueue: any[] = [];
    private flushInterval: NodeJS.Timeout;

    constructor() {
        // 배치 로깅을 위한 주기적 플러시
        this.flushInterval = setInterval(() => {
            this.flushLogs();
        }, 5000); // 5초마다
    }

    catch(exception: unknown, host: ArgumentsHost): void {
        // 비동기적으로 로그 큐에 추가
        this.queueLog(exception, host);

        // 즉시 응답 반환
        this.sendResponse(exception, host);
    }

    private queueLog(exception: unknown, host: ArgumentsHost): void {
        const request = host.switchToHttp().getRequest<Request>();

        this.logQueue.push({
            exception,
            request: {
                method: request.method,
                url: request.url,
                ip: request.ip,
                userAgent: request.get("User-Agent"),
            },
            timestamp: Date.now(),
        });

        // 큐가 너무 커지면 즉시 플러시
        if (this.logQueue.length > 100) {
            this.flushLogs();
        }
    }

    private flushLogs(): void {
        if (this.logQueue.length === 0) return;

        const logs = [...this.logQueue];
        this.logQueue = [];

        // 비동기적으로 로그 처리
        setImmediate(() => {
            logs.forEach((log) => {
                this.processLog(log);
            });
        });
    }

    onModuleDestroy() {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
        }
        this.flushLogs(); // 마지막 로그 플러시
    }
}
```

### 메모리 효율적인 스택 트레이스

```typescript
@Catch()
export class MemoryEfficientFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        // 스택 트레이스 크기 제한
        const stack = this.getTruncatedStack(exception);

        // 응답 처리
        this.handleException(exception, host, stack);
    }

    private getTruncatedStack(exception: unknown): string | undefined {
        if (!(exception instanceof Error) || !exception.stack) {
            return undefined;
        }

        const lines = exception.stack.split("\n");
        const maxLines = process.env.NODE_ENV === "production" ? 5 : 20;

        return lines.slice(0, maxLines).join("\n");
    }
}
```

---

## 프론트엔드 연동

### 에러 응답 타입 정의

```typescript
// 프론트엔드에서 사용할 에러 타입
interface ApiErrorResponse {
    success: false;
    error: {
        message: string;
        error: string;
        statusCode: number;
        timestamp: string;
        path: string;
        method: string;
        details?: any; // 유효성 검증 에러 등
    };
}

// 에러 핸들링 유틸리티
class ApiErrorHandler {
    static handle(error: ApiErrorResponse): void {
        const { statusCode, message } = error.error;

        switch (statusCode) {
            case 400:
                this.showValidationError(message, error.error.details);
                break;
            case 401:
                this.redirectToLogin();
                break;
            case 403:
                this.showAccessDeniedMessage();
                break;
            case 404:
                this.showNotFoundMessage();
                break;
            case 500:
                this.showServerErrorMessage();
                break;
            default:
                this.showGenericError(message);
        }
    }

    private static showValidationError(message: string, details?: any): void {
        // 유효성 검증 에러 표시 로직
    }

    private static redirectToLogin(): void {
        // 로그인 페이지로 리디렉션
        window.location.href = "/login";
    }
}
```

### API 클라이언트 에러 처리

```typescript
class ApiClient {
    async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
        try {
            const response = await fetch(endpoint, options);
            const data = await response.json();

            if (!response.ok) {
                throw new ApiError(data as ApiErrorResponse);
            }

            return data.data;
        } catch (error) {
            if (error instanceof ApiError) {
                ApiErrorHandler.handle(error.response);
            }
            throw error;
        }
    }
}

class ApiError extends Error {
    constructor(public response: ApiErrorResponse) {
        super(response.error.message);
        this.name = "ApiError";
    }
}
```
