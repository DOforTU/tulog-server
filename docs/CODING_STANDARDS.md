# 코딩 표준 및 규칙

## 함수명 명명 규칙

### 계층별 명명 패턴

## Tulog 프로젝트 계층별 네이밍 컨벤션 가이드

### 1. Controller 계층

- **역할**: REST API 라우팅 및 요청 응답 처리
- **명명 규칙**:
  - RESTful 메서드 명명
  - 직관적인 액션 명 중심 (도메인 생략)
  - `get`, `create`, `update`, `delete`, `restore`, `count` 등의 접두어 사용

| 목적               | 메서드 명                 | 예시 경로                  |
| ------------------ | ------------------------- | -------------------------- |
| 사용자 조회        | `getUser()`               | `GET /users/:id`           |
| 전체 조회 (관리자) | `getAllUsers()`           | `GET /users`               |
| 생성               | `createUser()`            | `POST /users`              |
| 수정               | `updateUser()`            | `PUT /users/:id`           |
| 삭제               | `deleteUser()`            | `DELETE /users/:id`        |
| 하드 삭제          | `deleteUserPermanently()` | `DELETE /users/:id/hard`   |
| 복구               | `restoreUser()`           | `PATCH /users/:id/restore` |
| 현재 유저 조회     | `getCurrentUser()`        | `GET /users/me`            |

---

### 2. Service 계층

- **역할**: 비즈니스 로직 처리
- **명명 규칙**:
  - 동사 + 도메인 명시 (`User`, `Blog`, `Team` 등)
  - `find`, `create`, `update`, `delete`, `restore`, `activate` 등 액션 중심

| 목적          | 메서드 명                |
| ------------- | ------------------------ |
| 전체 조회     | `findAllUsers()`         |
| 단일 조회     | `findUserById(id)`       |
| 이메일로 조회 | `findUserByEmail(email)` |
| 생성          | `createUser(data)`       |
| 수정          | `updateUser(id, data)`   |
| 삭제          | `deleteUser(id)`         |
| 복구          | `restoreUser(id)`        |
| 비활성화      | `deactivateUser(id)`     |

---

### 3. Repository 계층

- **역할**: DB 직접 접근 및 쿼리 처리
- **명명 규칙**:
  - CRUD 중심 (`find`, `save`, `delete`, `update`, `count` 등)
  - 조건 명시 (`findByEmail`, `findById`, `findDeletedById` 등)
  - 도메인 생략 가능 (동작이 우선)

| 목적             | 메서드 명             |
| ---------------- | --------------------- |
| ID로 조회        | `findById(id)`        |
| 이메일로 조회    | `findByEmail(email)`  |
| 전체 조회        | `findAll()`           |
| 삭제된 유저 조회 | `findDeleted()`       |
| 생성             | `saveUser(dto)`       |
| 수정             | `updateUser(id, dto)` |
| 삭제             | `deleteById(id)`      |
| 하드 삭제        | `hardDelete(id)`      |
| 복구             | `restore(id)`         |
| 카운트           | `countUsers()`        |
| 존재 여부        | `exists(id)`          |

---

### 부록: 네이밍 컨벤션 요약

- Controller: RESTful, 액션 중심 (`getUser`, `createUser`)
- Service: 도메인 + 동사 (`findUserById`, `createUser`)
- Repository: DB 동작 + 조건 (`findByEmail`, `deleteById`)

### Auth 모듈 명명 패턴

```typescript
// Auth Controller - 인증 특화 API
@Controller('auth')
export class AuthController {
  // ===== 인증 관련 API =====
  googleAuth()        // GET /auth/google
  googleAuthRedirect() // GET /auth/google/callback

  // ===== 토큰 관리 API =====
  refresh()          // POST /auth/refresh
  logout()           // POST /auth/logout
}

// Auth Service - 인증 특화 로직
@Injectable()
export class AuthService {
  // ===== 인증 및 검증 메서드 =====
  async validateGoogleUser(googleUser: GoogleUser): Promise<AuthResult> { ... }
  async refreshAccessToken(refreshToken: string): Promise<RefreshResult> { ... }

  // ===== 사용자 관리 메서드 =====
  async findUserById(userId: number): Promise<User | null> { ... }

  // ===== 토큰 관리 메서드 =====
  generateTokenPair(user: User): TokenPair { ... }
  generateAccessToken(user: User): string { ... }

  // ===== 쿠키 관리 메서드 =====
  setAuthCookies(res: Response, user: User, tokens: TokenPair): void { ... }
  clearAuthCookies(res: Response): void { ... }
}
```

### 명명 규칙 적용 이유

1. **Controller**: REST API 표준 준수로 API 예측 가능성 향상
2. **Service**: 도메인 명시로 다른 서비스에서 호출 시 명확성 확보
3. **Repository**: 데이터 접근 로직의 일관성 유지

### 예외 상황

```typescript
// 복잡한 비즈니스 로직은 동사 중심 명명
async sendWelcomeEmail(user: User): Promise<void> { ... }
async generateUserReport(userId: number): Promise<Report> { ... }
async validateUserAccess(userId: number, resourceId: number): Promise<boolean> { ... }
```

## 변수 명명 규칙

### 일반 변수

- **camelCase** 사용
- **의미있는 이름** 사용
- **줄임말 지양**

```typescript
// Good
const userRepository = new UserRepository();
const createdUser = await userService.createUser(userData);

// Bad
const userRepo = new UserRepository();
const usr = await userService.createUser(data);
```

### 상수

- **UPPER_SNAKE_CASE** 사용

```typescript
const DEFAULT_PAGE_SIZE = 10;
const MAX_RETRY_COUNT = 3;
const JWT_EXPIRATION_TIME = '15m';
```

### 타입 및 인터페이스

- **PascalCase** 사용
- **Interface 접두사 지양**

```typescript
// Good
interface UserCreateRequest {
  email: string;
  username: string;
}

// Bad
interface IUserCreateRequest {
  email: string;
  username: string;
}
```

## 파일명 규칙

### 기본 규칙

- **kebab-case** 사용
- **의미있는 이름** 사용

```
user.controller.ts
user.service.ts
user.repository.ts
user.entity.ts
user.dto.ts
user.module.ts
```

### 테스트 파일

```
user.service.spec.ts
user.controller.spec.ts
user.e2e-spec.ts
```

## 주석 규칙

### JSDoc 주석

```typescript
/**
 * 사용자 정보를 조회합니다.
 * @param id 사용자 ID
 * @returns 사용자 정보
 * @throws NotFoundException 사용자를 찾을 수 없는 경우
 */
async getUserById(id: number): Promise<User> {
  // 구현 로직
}
```

### TODO 주석

```typescript
// TODO: Redis 캐싱 구현 - 사용자 정보 조회 성능 최적화
// TODO: 입력 유효성 검증 강화
// FIXME: 동시성 문제 해결 필요
```

## 코드 구조 규칙

### 모듈 구조

```
src/
├── module-name/
│   ├── module-name.controller.ts
│   ├── module-name.service.ts
│   ├── module-name.repository.ts
│   ├── module-name.entity.ts
│   ├── module-name.dto.ts
│   └── module-name.module.ts
```

### Import 순서

```typescript
// 1. Node.js 내장 모듈
import { readFileSync } from 'fs';

// 2. 외부 라이브러리
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

// 3. 내부 모듈 (상대 경로)
import { User } from './user.entity';
import { UserRepository } from './user.repository';
```
