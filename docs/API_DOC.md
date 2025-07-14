# TULOG API Documentation

> TULOG API 서버의 상세한 엔드포인트 명세서입니다.

## 📋 목차

-   [기본 정보](#기본-정보)
-   [인증](#인증)
-   [사용자 관리](#사용자-관리)
-   [시스템](#시스템)
-   [에러 코드](#에러-코드)
-   [데이터 모델](#데이터-모델)

## 🔧 기본 정보

### Base URL

```
http://localhost:8000
```

### 응답 형식

모든 API 응답은 JSON 형식입니다.

### 인증 방식

-   **Google OAuth 2.0**: 로그인용
-   **JWT Bearer Token**: API 접근용

### 헤더

```http
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

---

## 🔐 인증 (Authentication)

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

**응답**: JWT 토큰과 함께 프론트엔드로 리다이렉트

```
http://localhost:8000/?token=<jwt_token>
```

---

### 토큰 갱신

JWT 토큰을 갱신합니다.

```http
POST /auth/refresh
```

**응답**:

```json
{
    "message": "Refresh token endpoint"
}
```

> **참고**: 현재 구현 예정

---

### 로그아웃

사용자 세션을 종료합니다.

```http
POST /auth/logout
```

**응답**:

```json
{
    "message": "Logged out successfully"
}
```

> **참고**: 현재 구현 예정

---

## 👥 사용자 관리 (Users)

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
        "googleId": "123456789",
        "profilePicture": "https://example.com/avatar.jpg",
        "provider": "google",
        "isActive": true,
        "isDeleted": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z",
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
    "username": "user123",
    "name": "홍길동",
    "nickname": "길동이",
    "googleId": "123456789",
    "profilePicture": "https://example.com/avatar.jpg",
    "provider": "google",
    "isActive": true,
    "isDeleted": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "deletedAt": null
}
```

**에러**:

-   `404`: 사용자를 찾을 수 없음

---

### 사용자 생성

새 사용자를 생성합니다.

```http
POST /users
```

**요청 본문**:

```json
{
    "email": "newuser@example.com",
    "username": "newuser",
    "password": "password123",
    "name": "새사용자",
    "nickname": "새사용자",
    "isActive": true
}
```

**응답**:

```json
{
    "id": 2,
    "email": "newuser@example.com",
    "username": "newuser",
    "name": "새사용자",
    "nickname": "새사용자",
    "isActive": true,
    "isDeleted": false,
    "createdAt": "2024-01-01T01:00:00.000Z",
    "updatedAt": "2024-01-01T01:00:00.000Z",
    "deletedAt": null
}
```

**에러**:

-   `409`: 이메일 또는 사용자명 중복
-   `400`: 잘못된 요청 데이터

---

### 사용자 수정

기존 사용자 정보를 수정합니다.

```http
PUT /users/{id}
```

**경로 파라미터**:

-   `id` (number): 사용자 ID

**요청 본문**:

```json
{
    "name": "수정된이름",
    "nickname": "수정된닉네임",
    "isActive": false
}
```

**응답**:

```json
{
    "id": 1,
    "email": "user@example.com",
    "username": "user123",
    "name": "수정된이름",
    "nickname": "수정된닉네임",
    "isActive": false,
    "updatedAt": "2024-01-01T02:00:00.000Z"
}
```

**에러**:

-   `404`: 사용자를 찾을 수 없음

---

### 사용자 소프트 삭제

사용자를 소프트 삭제합니다 (복구 가능).

```http
DELETE /users/{id}
```

**경로 파라미터**:

-   `id` (number): 사용자 ID

**응답**:

```json
{
    "message": "User deleted successfully",
    "deleted": true
}
```

**에러**:

-   `404`: 사용자를 찾을 수 없음

---

### 사용자 하드 삭제

사용자를 완전히 삭제합니다 (복구 불가능).

```http
DELETE /users/{id}/hard
```

**경로 파라미터**:

-   `id` (number): 사용자 ID

**응답**:

```json
{
    "message": "User permanently deleted",
    "deleted": true
}
```

**에러**:

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
    "message": "User restored successfully",
    "restored": true
}
```

**에러**:

-   `404`: 사용자를 찾을 수 없음

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
        "username": "deleted_user",
        "isDeleted": true,
        "deletedAt": "2024-01-01T03:00:00.000Z"
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

## 🔧 시스템 (System)

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

## ❌ 에러 코드

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

## 📊 데이터 모델

### User 엔티티

```typescript
interface User {
    id: number; // 기본 키 (자동 증가)
    email: string; // 이메일 (유일)
    username: string; // 사용자명 (유일)
    password?: string; // 비밀번호 (Google 사용자는 null)
    name?: string; // 실명
    nickname?: string; // 닉네임 (유일)
    googleId?: string; // Google OAuth ID
    profilePicture?: string; // 프로필 이미지 URL
    provider?: string; // 인증 제공자 ('google' 등)
    isActive: boolean; // 활성 상태 (기본값: true)
    isDeleted: boolean; // 삭제 상태 (기본값: false)
    createdAt: Date; // 생성 일시
    updatedAt: Date; // 수정 일시
    deletedAt?: Date; // 삭제 일시 (소프트 삭제 시)
}
```

### CreateUserDto

```typescript
interface CreateUserDto {
    email: string; // 필수
    username: string; // 필수
    password?: string; // 선택 (Google 사용자)
    name?: string; // 선택
    nickname?: string; // 선택
    googleId?: string; // 선택
    profilePicture?: string; // 선택
    provider?: string; // 선택
    isActive?: boolean; // 선택 (기본값: true)
}
```

### UpdateUserDto

```typescript
interface UpdateUserDto {
    email?: string; // 선택
    username?: string; // 선택
    password?: string; // 선택
    name?: string; // 선택
    nickname?: string; // 선택
    googleId?: string; // 선택
    profilePicture?: string; // 선택
    provider?: string; // 선택
    isActive?: boolean; // 선택
}
```

---

## 📝 추가 정보

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

-   개발 환경에서는 `synchronize: true`로 설정되어 있어 스키마가 자동 동기화됩니다
-   프로덕션 환경에서는 마이그레이션을 사용하세요
-   Google OAuth 설정이 필요합니다 (.env 파일 참조)
-   모든 날짜는 ISO 8601 형식 (UTC)입니다

---

## 🔄 업데이트 로그

-   **v0.0.1** (2024-01-01): 초기 API 구현
    -   사용자 CRUD 작업
    -   Google OAuth 인증
    -   소프트 삭제 기능
    -   JWT 토큰 인증
