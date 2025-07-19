# TULOG API Interceptors Documentation

> Detailed documentation for the interceptor system of TULOG API server.

## Table of Contents

-   [Overview](#overview)
-   [Response Interceptor](#response-interceptor)
-   [Interceptor Execution Flow](#interceptor-execution-flow)
-   [Response Format Standardization](#response-format-standardization)
-   [Configuration and Application](#configuration-and-application)
-   [Extension and Customization](#extension-and-customization)

---

## Overview

Interceptors are NestJS's AOP (Aspect-Oriented Programming) feature that allows executing additional logic before and after method execution. TULOG API implements response interceptors to standardize all API response formats and maintain consistency.

### Interceptor Characteristics

1. **AOP Pattern**: Separates cross-cutting concerns to eliminate code duplication
2. **Observable-based**: Uses RxJS Observable for reactive programming
3. **Global/Local Application**: Can be applied globally or to specific controllers/methods
4. **Transformation and Extension**: Can transform and extend request/response data

---

## Response Interceptor

### Location

`src/common/interceptors/response.interceptor.ts`

### Role

-   Standardize all API response formats
-   Add metadata to success responses
-   Provide consistent JSON structure

### Implementation Details

```typescript
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export interface Response<T> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp: string;
    path: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
        const request = context.switchToHttp().getRequest();

        return next.handle().pipe(
            map((data) => ({
                success: true,
                data,
                timestamp: new Date().toISOString(),
                path: request.url,
            }))
        );
    }
}
```

### 인터셉터 동작 원리

1. **ExecutionContext**: 현재 실행 컨텍스트에서 HTTP 요청 정보 추출
2. **CallHandler.handle()**: 실제 라우트 핸들러 실행
3. **RxJS pipe()**: Observable 스트림에서 데이터 변환
4. **map() 연산자**: 원본 데이터를 표준 형식으로 래핑

---

## 인터셉터 실행 흐름

```
Request → Guards → Interceptor (Before) → Route Handler → Interceptor (After) → Response
```

### 상세 실행 단계

1. **요청 수신**: HTTP 요청이 서버에 도착
2. **가드 실행**: 인증/권한 검사 (Guards)
3. **인터셉터 진입**: `intercept()` 메서드 호출
4. **컨텍스트 추출**: ExecutionContext에서 요청 정보 획득
5. **핸들러 실행**: `next.handle()` 호출로 실제 비즈니스 로직 실행
6. **응답 변환**: `map()` 연산자로 응답 데이터 표준화
7. **응답 반환**: 클라이언트에게 표준화된 응답 전송

### 예시 흐름

```typescript
// 1. 컨트롤러 메서드 실행 전
const request = context.switchToHttp().getRequest();

// 2. 실제 컨트롤러 메서드 실행
return next.handle().pipe(
    // 3. 컨트롤러 메서드 실행 후 응답 변환
    map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
        path: request.url,
    }))
);
```

---

## 응답 형식 표준화

### 표준 응답 인터페이스

```typescript
interface Response<T> {
    success: boolean; // 요청 성공 여부
    data?: T; // 실제 응답 데이터
    message?: string; // 추가 메시지 (선택적)
    timestamp: string; // 응답 생성 시간 (ISO 8601)
    path: string; // 요청된 API 경로
}
```

### 성공 응답 예시

#### 단일 객체 응답

```json
{
    "success": true,
    "data": {
        "id": 1,
        "email": "user@example.com",
        "username": "홍길동",
        "nickname": "user"
    },
    "timestamp": "2025-07-15T03:45:30.123Z",
    "path": "/users/me"
}
```

#### 배열 응답

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "email": "user1@example.com",
            "username": "사용자1"
        },
        {
            "id": 2,
            "email": "user2@example.com",
            "username": "사용자2"
        }
    ],
    "timestamp": "2025-07-15T03:45:30.123Z",
    "path": "/users"
}
```

#### 단순 메시지 응답

```json
{
    "success": true,
    "data": {
        "message": "User deleted successfully"
    },
    "timestamp": "2025-07-15T03:45:30.123Z",
    "path": "/users/1"
}
```

### 빈 응답 처리

```typescript
// 컨트롤러에서 빈 응답 반환
@Delete(':id')
async remove(@Param('id') id: number): Promise<void> {
  await this.userService.remove(id);
  // return 문 없음
}

// 인터셉터가 변환한 응답
{
  "success": true,
  "data": undefined,
  "timestamp": "2025-07-15T03:45:30.123Z",
  "path": "/users/1"
}
```

---

## 설정 및 적용

### 전역 인터셉터 등록

```typescript
// main.ts
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 전역 인터셉터 설정
    // 모든 HTTP 요청/응답에 ResponseInterceptor가 자동 적용
    app.useGlobalInterceptors(new ResponseInterceptor());

    await app.listen(8000);
}
```

### 특정 컨트롤러에만 적용

```typescript
import { UseInterceptors } from "@nestjs/common";
import { ResponseInterceptor } from "../common/interceptors/response.interceptor";

@Controller("users")
@UseInterceptors(ResponseInterceptor) // 컨트롤러 레벨: UserController의 모든 메서드에 적용
export class UserController {
    @Get()
    @UseInterceptors(ResponseInterceptor) // 메서드 레벨: 이 메서드에만 적용 (중복 적용 예시)
    async findAll() {
        return this.userService.findAll();
    }

    @Get(":id")
    async findOne(@Param("id") id: string) {
        // 컨트롤러 레벨 인터셉터만 적용됨
        return this.userService.findOne(id);
    }
}
```

### 의존성 주입을 통한 등록

```typescript
// app.module.ts
import { APP_INTERCEPTOR } from "@nestjs/core";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

@Module({
    providers: [
        {
            provide: APP_INTERCEPTOR, // NestJS 전역 인터셉터 토큰
            useClass: ResponseInterceptor, // 사용할 인터셉터 클래스
        },
        // 다른 전역 인터셉터들도 추가 가능
        // {
        //     provide: APP_INTERCEPTOR,
        //     useClass: LoggingInterceptor,
        // },
    ],
})
export class AppModule {}
```

### 각 방법의 비교 및 사용 시나리오

| 방법                | 적용 범위   | 설정 복잡도 | 유연성 | 테스트 용이성 | 권장 시나리오                    |
| ------------------- | ----------- | ----------- | ------ | ------------- | -------------------------------- |
| 전역 등록 (main.ts) | 모든 라우트 | 낮음        | 낮음   | 보통          | 모든 API가 동일한 형식 필요 시   |
| 데코레이터 적용     | 선택적      | 보통        | 높음   | 높음          | 특정 컨트롤러/메서드만 필요 시   |
| 의존성 주입         | 모든 라우트 | 높음        | 보통   | 높음          | 다른 서비스와 연동이 필요한 경우 |

### 실행 우선순위

여러 인터셉터가 동시에 적용된 경우의 실행 순서:

1. **전역 인터셉터** (main.ts 또는 APP_INTERCEPTOR)
2. **컨트롤러 레벨 인터셉터** (@UseInterceptors on class)
3. **메서드 레벨 인터셉터** (@UseInterceptors on method)

```typescript
// 실행 순서 예시
app.useGlobalInterceptors(new GlobalInterceptor()); // 1순위

@Controller("users")
@UseInterceptors(ControllerInterceptor) // 2순위
export class UserController {
    @Get()
    @UseInterceptors(MethodInterceptor) // 3순위
    async findAll() {
        return this.userService.findAll();
    }
}
```

---

## 확장 및 커스터마이징

### 조건부 응답 변환

```typescript
@Injectable()
export class ConditionalResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();

        return next.handle().pipe(
            map((data) => {
                // 특정 엔드포인트는 원본 응답 유지
                if (request.url.startsWith("/raw/")) {
                    return data;
                }

                // 나머지는 표준 형식으로 변환
                return {
                    success: true,
                    data,
                    timestamp: new Date().toISOString(),
                    path: request.url,
                };
            })
        );
    }
}
```

### 에러 상황 처리

```typescript
@Injectable()
export class ErrorAwareResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => ({
                success: true,
                data,
                timestamp: new Date().toISOString(),
                path: context.switchToHttp().getRequest().url,
            })),
            catchError((error) => {
                // 인터셉터에서 에러 처리 (일반적으로 필터가 담당)
                throw error;
            })
        );
    }
}
```

### 성능 모니터링 인터셉터

```typescript
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
    private readonly logger = new Logger("Performance");

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const startTime = Date.now();
        const request = context.switchToHttp().getRequest();

        return next.handle().pipe(
            tap(() => {
                const responseTime = Date.now() - startTime;
                this.logger.log(`${request.method} ${request.url} - ${responseTime}ms`);
            }),
            map((data) => ({
                success: true,
                data,
                timestamp: new Date().toISOString(),
                path: request.url,
                responseTime: Date.now() - startTime,
            }))
        );
    }
}
```

### 캐싱 인터셉터

```typescript
@Injectable()
export class CacheInterceptor implements NestInterceptor {
    private cache = new Map<string, any>();

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const cacheKey = `${request.method}:${request.url}`;

        // GET 요청만 캐싱
        if (request.method === "GET" && this.cache.has(cacheKey)) {
            return of(this.cache.get(cacheKey));
        }

        return next.handle().pipe(
            tap((data) => {
                if (request.method === "GET") {
                    // 5분간 캐싱
                    this.cache.set(cacheKey, data);
                    setTimeout(() => this.cache.delete(cacheKey), 5 * 60 * 1000);
                }
            })
        );
    }
}
```

---

## 프론트엔드 연동

### TypeScript 타입 정의

```typescript
// 프론트엔드에서 사용할 응답 타입
interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    timestamp?: string;
    path?: string;
}

// 사용 예시
const response: ApiResponse<User> = await fetch("/users/me");
if (response.success) {
    console.log(response.data.email);
}
```

### API 클라이언트 구현

```typescript
class ApiClient {
    async request<T>(endpoint: string): Promise<ApiResponse<T>> {
        const response = await fetch(endpoint);
        const data: ApiResponse<T> = await response.json();

        // 표준 응답 형식 검증
        if (!("success" in data)) {
            throw new Error("Invalid response format");
        }

        return data;
    }
}
```

---

## 테스트

### 인터셉터 단위 테스트

```typescript
describe("ResponseInterceptor", () => {
    let interceptor: ResponseInterceptor<any>;
    let executionContext: ExecutionContext;
    let callHandler: CallHandler;

    beforeEach(() => {
        interceptor = new ResponseInterceptor();

        executionContext = {
            switchToHttp: () => ({
                getRequest: () => ({ url: "/test" }),
            }),
        } as ExecutionContext;

        callHandler = {
            handle: () => of({ id: 1, name: "test" }),
        };
    });

    it("should transform response to standard format", (done) => {
        interceptor.intercept(executionContext, callHandler).subscribe((result) => {
            expect(result.success).toBe(true);
            expect(result.data).toEqual({ id: 1, name: "test" });
            expect(result.timestamp).toBeDefined();
            expect(result.path).toBe("/test");
            done();
        });
    });
});
```

### E2E 테스트

**E2E (End-to-End) 테스트란?**

-   **정의**: 애플리케이션의 전체 흐름을 실제 환경과 유사하게 테스트하는 방법
-   **목적**: 사용자의 실제 사용 시나리오를 시뮬레이션하여 시스템 전체가 올바르게 작동하는지 검증
-   **범위**: HTTP 요청 → 미들웨어 → 가드 → 인터셉터 → 컨트롤러 → 서비스 → 데이터베이스 → 응답까지 전체 과정
-   **특징**: 실제 서버를 띄우고 HTTP 클라이언트로 API를 호출하여 테스트

```typescript
describe("Response Format (e2e)", () => {
    it("should return standardized response", () => {
        return request(app.getHttpServer()) // 실제 HTTP 서버에 요청
            .get("/users") // GET /users 엔드포인트 호출
            .expect(200) // HTTP 상태 코드 200 기대
            .expect((res) => {
                // 응답 본문 검증
                expect(res.body.success).toBe(true); // 인터셉터가 추가한 success 필드
                expect(res.body.data).toBeDefined(); // 실제 데이터 존재 확인
                expect(res.body.timestamp).toBeDefined(); // 타임스탬프 존재 확인
                expect(res.body.path).toBe("/users"); // 요청 경로 확인
            });
    });

    // 추가 E2E 테스트 예시
    it("should handle error responses correctly", () => {
        return request(app.getHttpServer())
            .get("/users/invalid-id")
            .expect(404)
            .expect((res) => {
                expect(res.body.success).toBe(false);
                expect(res.body.error).toBeDefined();
                expect(res.body.error.statusCode).toBe(404);
            });
    });

    it("should require authentication for protected routes", () => {
        return request(app.getHttpServer()).post("/users").send({ name: "Test User" }).expect(401); // 인증 없이 접근 시 401 에러
    });
});
```

**E2E vs 단위 테스트 차이점:**

> [이곳](https://github.com/DOforTU/tulog/blob/main/web-study/DIFF_E2E_UNIT.md) 참고

---

## 모니터링 및 디버깅

### 응답 형식 검증

```typescript
// 개발 환경에서 응답 형식 검증
@Injectable()
export class ValidationResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                const response = {
                    success: true,
                    data,
                    timestamp: new Date().toISOString(),
                    path: context.switchToHttp().getRequest().url,
                };

                // 개발 환경에서만 검증
                if (process.env.NODE_ENV === "development") {
                    this.validateResponse(response);
                }

                return response;
            })
        );
    }

    private validateResponse(response: any) {
        if (typeof response.success !== "boolean") {
            console.warn("Invalid success field in response");
        }
        if (!response.timestamp) {
            console.warn("Missing timestamp in response");
        }
        // ... 추가 검증 로직
    }
}
```

### 응답 크기 모니터링

```typescript
@Injectable()
export class ResponseSizeInterceptor implements NestInterceptor {
    private readonly logger = new Logger("ResponseSize");

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            map((data) => {
                const response = {
                    success: true,
                    data,
                    timestamp: new Date().toISOString(),
                    path: context.switchToHttp().getRequest().url,
                };

                const size = JSON.stringify(response).length;
                if (size > 1024 * 1024) {
                    // 1MB 초과 시 경고
                    this.logger.warn(`Large response detected: ${size} bytes`);
                }

                return response;
            })
        );
    }
}
```

---

## 문제 해결

### 일반적인 문제

1. **인터셉터가 적용되지 않음**

    - 전역 등록 확인
    - 실행 순서 확인

2. **응답 데이터가 이중 래핑됨**

    - 컨트롤러에서 이미 표준 형식으로 반환하는지 확인
    - 인터셉터 중복 적용 확인

3. **타입 에러**
    - 제네릭 타입 선언 확인
    - TypeScript 설정 확인
