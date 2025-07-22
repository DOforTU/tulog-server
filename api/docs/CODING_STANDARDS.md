# 코딩 표준 및 규칙

## 함수명 명명 규칙

### 계층별 명명 패턴

```typescript
// Controller - REST API 규칙
@Controller('users')
export class UserController {
  // ===== 기본 CRUD - REST API =====
  findOne()     // GET /users/:id
  create()      // POST /users
  update()      // PUT /users/:id
  remove()      // DELETE /users/:id

  // ===== 특수 조회 API =====
  getCurrentUser()  // GET /users/me
  findDeleted()     // GET /users/deleted
  getCount()        // GET /users/count

  // ===== 관리자 전용 API =====
  findAll()         // GET /users (관리자 전용)
  hardDelete()      // DELETE /users/:id/hard
  restore()         // PATCH /users/:id/restore
}

// Service - 도메인별 명시 패턴
@Injectable()
export class UserService {
  // ===== 기본 CRUD - 도메인 명시 =====
  async getAllUsers(): Promise<User[]> { ... }
  async getUserById(id: number): Promise<User> { ... }
  async createUser(userData: any): Promise<User> { ... }
  async updateUser(id: number, data: any): Promise<User> { ... }
  async deleteUser(id: number): Promise<void> { ... }

  // ===== 조회 메서드 - 도메인 명시 =====
  async getUserByEmail(email: string): Promise<User> { ... }
  async getUserByGoogleId(googleId: string): Promise<User> { ... }

  // ===== 비즈니스 로직 - 동사 중심 =====
  async activateUser(id: number): Promise<User> { ... }
  async deactivateUser(id: number): Promise<User> { ... }
  async restoreUser(id: number): Promise<User> { ... }

  // ===== 내부 헬퍼 메서드 - 간단한 형태 =====
  private async findById(id: number): Promise<User | null> { ... }
  private async findByEmail(email: string): Promise<User | null> { ... }
}

// Repository - 데이터 접근 명시
@Injectable()
export class UserRepository {
  // ===== 기본 CRUD - 데이터 접근 =====
  async findById(id: number): Promise<User | null> { ... }
  async create(createUserDto: CreateUserDto): Promise<User> { ... }
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> { ... }
  async delete(id: number): Promise<boolean> { ... }

  // ===== 조건별 조회 - 데이터 접근 =====
  async findAll(): Promise<User[]> { ... }                    // 관리자 전용
  async findByEmail(email: string): Promise<User | null> { ... }
  async findByUsername(username: string): Promise<User | null> { ... }
  async findByGoogleId(googleId: string): Promise<User | null> { ... }
  async findByEmailIncludingDeleted(email: string): Promise<User | null> { ... }

  // ===== 삭제된 데이터 조회 =====
  async findDeleted(): Promise<User[]> { ... }
  async findDeletedById(id: number): Promise<User | null> { ... }

  // ===== 특수 작업 - 데이터 접근 =====
  async createGoogleUser(userData: GoogleUserData): Promise<User> { ... }
  async hardDelete(id: number): Promise<boolean> { ... }
  async restore(id: number): Promise<boolean> { ... }

  // ===== 유틸리티 메서드 =====
  async exists(id: number): Promise<boolean> { ... }
  async count(): Promise<number> { ... }
}
```

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
