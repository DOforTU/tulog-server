# TULOG API Documentation

> TULOG API 서버의 상세한 엔드포인트 명세서입니다.

## 목차

-   [기본 정보](#기본-정보)
-   [인증](#인증)
-   [사용자 관리](#사용자-관리)
-   [시스템](#시스템)
-   [에러 코드](#에러-코드)
-   [데이터 모델](#데이터-모델)

## 기본 정보

### Base URL

```
http://localhost:8000
```

### 응답 형식

모든 API 응답은 JSON 형식입니다.

### 인증 방식

-   **Google OAuth 2.0**: 소셜 로그인 전용
-   **JWT + Refresh Token**: HttpOnly 쿠키 기반 인증
-   **자동 토큰 갱신**: 14분마다 자동 리프레시

### 헤더

```http
Content-Type: application/json
Cookie: accessToken=<jwt_token>; refreshToken=<refresh_token>; userInfo=<user_info>
```

> **보안**: 모든 토큰은 HttpOnly 쿠키로 전송되어 XSS 공격을 방어합니다.

---

## 인증 (Authentication)

### Google OAuth 로그인 시작

Google OAuth 인증 플로우를 시작합니다.

```http
GET /auth/google
```

**응답**: Google 로그인 페이지로 리다이렉트

---

### Google OAuth 콜백

Google 인증 완료 후 콜백을 처리합니다.

```http
GET /auth/google/callback
```

**쿼리 파라미터**:

-   `code`: Google에서 제공하는 인증 코드

**응답**:

1. **쿠키 설정**:

    - `accessToken`: JWT 액세스 토큰 (HttpOnly, 15분 만료)
    - `refreshToken`: JWT 리프레시 토큰 (HttpOnly, 30일 만료)
    - `userInfo`: 사용자 정보 (30일 만료)

2. **리다이렉트**:

```
http://localhost:3000/login?success=true
```

**쿠키 예시**:

```http
Set-Cookie: accessToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; SameSite=Strict; Max-Age=900
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; SameSite=Strict; Max-Age=2592000
Set-Cookie: userInfo={"id":1,"email":"user@example.com",...}; SameSite=Strict; Max-Age=2592000
```

---

### 토큰 갱신

리프레시 토큰을 사용하여 새 액세스 토큰을 발급받습니다.

```http
POST /auth/refresh
```

**요청 헤더**:

```http
Cookie: refreshToken=<refresh_token>
```

**응답 (성공)**:

```json
{
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "홍길동",
        "nickname": "user",
        "profilePicture": "https://lh3.googleusercontent.com/...",
        "provider": "google"
    }
}
```

**응답 (실패)**:

```json
{
    "success": false,
    "message": "리프레시 토큰이 없습니다."
}
```

**에러 코드**:

-   `401`: 리프레시 토큰이 없거나 유효하지 않음

> **자동 갱신**: 프론트엔드에서 14분마다 자동으로 호출됩니다.

---

### 로그아웃

사용자 세션을 종료하고 모든 인증 쿠키를 삭제합니다.

```http
POST /auth/logout
```

**응답**:

```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

**쿠키 삭제**:

-   `accessToken`: 삭제됨
-   `refreshToken`: 삭제됨
-   `userInfo`: 삭제됨

**응답 헤더**:

```http
Set-Cookie: accessToken=; Max-Age=0
Set-Cookie: refreshToken=; Max-Age=0
Set-Cookie: userInfo=; Max-Age=0
```

---

## 사용자 관리 (Users)

> **참고**: 별도 회원가입 없이 Google OAuth로만 계정이 생성됩니다.

### 현재 로그인한 사용자 정보 조회

현재 로그인한 사용자의 정보를 조회합니다.

```http
GET /users/me
```

**요청 헤더**:

```http
Cookie: accessToken=<access_token>
```

**응답**:

```json
{
    "id": 1,
    "email": "user@example.com",
    "username": "홍길동",
    "nickname": "user",
    "googleId": "108729663647433890790",
    "profilePicture": "https://lh3.googleusercontent.com/a/ACg8ocI...",
    "provider": "google",
    "isActive": true,
    "isDeleted": false,
    "createdAt": "2025-07-14T14:30:00.000Z",
    "updatedAt": "2025-07-14T14:30:00.000Z",
    "deletedAt": null
}
```

**에러**:

-   `401`: 인증되지 않음 (JWT 토큰 필요)

---

### 전체 사용자 조회

모든 활성 사용자를 조회합니다.

```http
GET /users
```

**응답**:

```json
[
    {
        "id": 1,
        "email": "user@example.com",
        "username": "홍길동",
        "nickname": "user",
        "googleId": "108729663647433890790",
        "profilePicture": "https://lh3.googleusercontent.com/a/ACg8ocI...",
        "provider": "google",
        "isActive": true,
        "isDeleted": false,
        "createdAt": "2025-07-14T14:30:00.000Z",
        "updatedAt": "2025-07-14T14:30:00.000Z",
        "deletedAt": null
    }
]
```

---

### 사용자 상세 조회

특정 사용자의 상세 정보를 조회합니다.

```http
GET /users/{id}
```

**경로 파라미터**:

-   `id` (number): 사용자 ID

**응답**:

```json
{
    "id": 1,
    "email": "user@example.com",
    "username": "홍길동",
    "nickname": "user",
    "googleId": "108729663647433890790",
    "profilePicture": "https://lh3.googleusercontent.com/a/ACg8ocI...",
    "provider": "google",
    "isActive": true,
    "isDeleted": false,
    "createdAt": "2025-07-14T14:30:00.000Z",
    "updatedAt": "2025-07-14T14:30:00.000Z",
    "deletedAt": null
}
```

**에러**:

-   `404`: 사용자를 찾을 수 없음

---

### 사용자 정보 업데이트

기존 사용자 정보를 수정합니다.

```http
PUT /users/{id}
```

**경로 파라미터**:

-   `id` (number): 사용자 ID

**요청 본문**:

```json
{
    "username": "수정된이름",
    "nickname": "수정된닉네임",
    "isActive": false
}
```

**응답**:

```json
{
    "id": 1,
    "email": "user@example.com",
    "username": "수정된이름",
    "nickname": "수정된닉네임",
    "isActive": false,
    "updatedAt": "2025-07-14T15:00:00.000Z"
}
```

**에러**:

-   `404`: 사용자를 찾을 수 없음
-   `409`: 사용자명 또는 닉네임 중복

---

### 사용자 소프트 삭제

사용자를 소프트 삭제합니다 (복구 가능).

```http
DELETE /users/{id}
```

**경로 파라미터**:

-   `id` (number): 사용자 ID

**요청 헤더**:

```http
Cookie: accessToken=<access_token>
```

**응답**:

```json
{
    "message": "User deleted successfully"
}
```

**에러**:

-   `401`: 인증되지 않음 (JWT 토큰 필요)
-   `404`: 사용자를 찾을 수 없음

---

### 사용자 하드 삭제

사용자를 완전히 삭제합니다 (복구 불가능).

```http
DELETE /users/{id}/hard
```

**경로 파라미터**:

-   `id` (number): 사용자 ID

**요청 헤더**:

```http
Cookie: accessToken=<access_token>
```

**응답**:

```json
{
    "message": "User permanently deleted"
}
```

**에러**:

-   `401`: 인증되지 않음 (JWT 토큰 필요)
-   `404`: 사용자를 찾을 수 없음

---

### 사용자 복구

소프트 삭제된 사용자를 복구합니다.

```http
PATCH /users/{id}/restore
```

**경로 파라미터**:

-   `id` (number): 사용자 ID

**응답**:

```json
{
    "id": 1,
    "email": "restored@example.com",
    "username": "복구된사용자",
    "nickname": "restored",
    "isDeleted": false,
    "deletedAt": null,
    "updatedAt": "2025-07-14T16:00:00.000Z"
}
```

**에러**:

-   `404`: 삭제된 사용자를 찾을 수 없음

---

### 삭제된 사용자 조회

소프트 삭제된 사용자 목록을 조회합니다.

```http
GET /users/deleted
```

**응답**:

```json
[
    {
        "id": 3,
        "email": "deleted@example.com",
        "username": "삭제된사용자",
        "nickname": "deleted",
        "isDeleted": true,
        "deletedAt": "2025-07-14T15:30:00.000Z"
    }
]
```

---

### 사용자 수 조회

전체 활성 사용자 수를 조회합니다.

```http
GET /users/count
```

**응답**:

```json
{
    "count": 25
}
```

---

## 시스템 (System)

### 헬스 체크

기본 시스템 상태를 확인합니다.

```http
GET /api
```

**응답**:

```text
Hello World!
```

---

### 상세 헬스 체크

시스템의 상세한 상태 정보를 확인합니다.

```http
GET /api/health
```

**응답**:

```json
{
    "status": "OK",
    "timestamp": "2024-01-01T04:00:00.000Z"
}
```

---

### 테스트 페이지

Google 로그인 테스트 페이지를 표시합니다.

```http
GET /
```

**응답**: HTML 페이지 (Google 로그인 테스트 UI)

---

## 에러 코드

### HTTP 상태 코드

| 코드  | 설명          | 예시                             |
| ----- | ------------- | -------------------------------- |
| `200` | 성공          | 요청이 성공적으로 처리됨         |
| `201` | 생성됨        | 새 리소스가 생성됨               |
| `400` | 잘못된 요청   | 유효하지 않은 데이터             |
| `401` | 인증되지 않음 | JWT 토큰이 없거나 유효하지 않음  |
| `403` | 권한 없음     | 접근 권한이 없음                 |
| `404` | 찾을 수 없음  | 요청한 리소스가 존재하지 않음    |
| `409` | 충돌          | 중복된 데이터 (이메일, 사용자명) |
| `500` | 서버 오류     | 내부 서버 오류                   |

### 에러 응답 형식

```json
{
    "statusCode": 404,
    "message": "User with ID 999 not found",
    "error": "Not Found"
}
```

---

## 데이터 모델

### User 엔티티

```typescript
interface User {
    id: number; // 기본 키 (자동 증가)
    email: string; // 이메일 (유일, Google에서 가져옴)
    username: string; // 사용자명 (Google 실명)
    nickname: string; // 닉네임 (이메일 앞부분)
    googleId: string; // Google OAuth ID (유일)
    profilePicture?: string; // Google 프로필 이미지 URL
    provider: string; // 인증 제공자 ('google')
    isActive: boolean; // 활성 상태 (기본값: true)
    isDeleted: boolean; // 삭제 상태 (기본값: false)
    createdAt: Date; // 생성 일시
    updatedAt: Date; // 수정 일시
    deletedAt?: Date; // 삭제 일시 (소프트 삭제 시)
}
```

### UpdateUserDto

```typescript
interface UpdateUserDto {
    email?: string; // 선택 (변경 불가)
    username?: string; // 선택
    nickname?: string; // 선택
    profilePicture?: string; // 선택
    isActive?: boolean; // 선택
}
```

### JWT 토큰 페이로드

#### 액세스 토큰 (15분 만료)

```typescript
interface AccessTokenPayload {
    sub: number; // 사용자 ID
    email: string; // 사용자 이메일
    type: "access"; // 토큰 타입
    iat: number; // 발급 시간
    exp: number; // 만료 시간
}
```

#### 리프레시 토큰 (30일 만료)

```typescript
interface RefreshTokenPayload {
    sub: number; // 사용자 ID
    type: "refresh"; // 토큰 타입
    iat: number; // 발급 시간
    exp: number; // 만료 시간
}
```

---

## 추가 정보

### 개발 환경에서의 테스트

1. **Google 로그인 테스트**:

    - `http://localhost:8000`에 접속
    - "Google로 로그인" 버튼 클릭
    - Google 계정으로 인증
    - JWT 토큰 확인

2. **API 테스트 도구**:

    - Postman, Thunder Client, 또는 curl 사용
    - JWT 토큰을 Authorization 헤더에 포함

3. **데이터베이스 확인**:
    - PostgreSQL 클라이언트로 `tulog.server_api.user` 테이블 확인

### 주의사항

-   **소셜 로그인 전용**: 별도 회원가입 없이 Google OAuth로만 계정 생성
-   **HttpOnly 쿠키**: 모든 토큰은 HttpOnly 쿠키로 전송되어 XSS 공격 방어
-   **자동 토큰 갱신**: 프론트엔드에서 14분마다 자동으로 토큰 갱신
-   **개발 환경**: `synchronize: true`로 설정되어 스키마 자동 동기화
-   **프로덕션 환경**: 마이그레이션 사용 필요
-   **Google OAuth 설정**: `.env` 파일에서 Google OAuth 클라이언트 설정 필수
-   **날짜 형식**: 모든 날짜는 ISO 8601 형식 (UTC)

### 쿠키 보안 설정

```typescript
// 개발 환경
sameSite: 'strict'
secure: false
httpOnly: true (토큰의 경우)

// 프로덕션 환경
sameSite: 'strict'
secure: true
httpOnly: true (토큰의 경우)
```

---

## 업데이트 로그

-   **v1.0.0** (2025-07-15): JWT + 리프레시 토큰 인증 시스템 구현

    -   HttpOnly 쿠키 기반 보안 토큰 관리
    -   자동 토큰 갱신 (14분 간격)
    -   Google OAuth 전용 소셜 로그인
    -   XSS/CSRF 방어 보안 강화
    -   사용자 CRUD 작업 (소셜 로그인 기반)
    -   소프트 삭제 및 복구 기능

-   **v0.0.1** (2024-01-01): 초기 API 구현
    -   기본 사용자 CRUD 작업
    -   Google OAuth 인증 기초
    -   Basic JWT 토큰 인증
