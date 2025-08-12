# TULOG API Specification

이 디렉토리는 TULOG 서버의 API 명세서를 포함하고 있습니다.

## 📁 API 명세서 구조

### 🔐 인증 및 사용자 관리

-   **[AUTH.md](./AUTH.md)** - 인증 API (로그인, 회원가입, 토큰 관리)
-   **[USER.md](./USER.md)** - 사용자 관리 API (프로필 조회/수정, 사용자 삭제)

### 👥 소셜 기능

-   **[USER_FOLLOW.md](./USER_FOLLOW.md)** - 사용자 팔로우 API (팔로우/언팔로우, 팔로워/팔로잉 조회)
-   **[BLOCK.md](./BLOCK.md)** - 사용자 차단 API (차단/차단해제, 차단 목록 조회)

### 🏢 팀 관리

-   **[TEAM.md](./TEAM.md)** - 팀 관리 API (팀 생성/수정/조회)
-   **[TEAM_FOLLOW.md](./TEAM_FOLLOW.md)** - 팀 팔로우 API (팀 팔로우/언팔로우)

### 📁 파일 관리

-   **[FILE.md](./FILE.md)** - 파일 업로드 API (프로필 이미지, 팀 이미지 업로드)

### 🔔 알림 관리

-   **[NOTICE.md](./NOTICE.md)** - 알림 API (알림 조회/읽음 처리/삭제)

---

## 🔗 기본 API 정보

### Base URL

```
http://localhost:8000/api
```

### 공통 응답 형식

#### 성공 응답

```json
{
    "success": true,
    "data": {},
    "timestamp": "2025-08-10T12:00:00.000Z",
    "path": "/api/endpoint"
}
```

#### 실패 응답

```json
{
    "success": false,
    "statusCode": 400,
    "message": ["Error message"],
    "error": "BAD_REQUEST",
    "timestamp": "2025-08-10T12:00:00.000Z",
    "path": "/api/endpoint"
}
```

---

## 🔒 인증 방식

### JWT Token

-   **Access Token**: 15분 유효기간, HttpOnly 쿠키로 전송
-   **Refresh Token**: 7일 유효기간, HttpOnly 쿠키로 전송

### Guards

-   **JwtAuthGuard**: JWT 토큰 인증 (활성/비활성 사용자 모두 허용)
-   **SmartAuthGuard**: JWT 토큰 인증 + 활성 사용자만 허용
-   **AdminGuard**: 관리자 권한 필요
-   **RateLimitGuard**: 요청 빈도 제한

---

## 📋 API 엔드포인트 요약

### Health Check

-   `GET /api` - 서버 상태 확인
-   `GET /api/health` - 헬스체크

### 인증 (AUTH)

-   `POST /api/auth/signup` - 회원가입
-   `POST /api/auth/login` - 로그인
-   `GET /api/auth/google` - Google OAuth 시작
-   `GET /api/auth/google/callback` - Google OAuth 콜백
-   `POST /api/auth/refresh` - 토큰 갱신
-   `POST /api/auth/logout` - 로그아웃

### 사용자 (USER)

-   `GET /api/users/me` - 내 정보 조회
-   `PATCH /api/users/me` - 내 정보 수정
-   `GET /api/users/:id` - 사용자 조회 (ID)
-   `GET /api/users/nickname/:nickname` - 사용자 조회 (닉네임)
-   `GET /api/users/:id/details` - 사용자 상세 정보 (팀, 팔로워 포함)

### 팔로우 (FOLLOW)

-   `POST /api/users/:id/follow` - 사용자 팔로우
-   `DELETE /api/users/:id/unfollow` - 사용자 언팔로우
-   `GET /api/users/me/followers` - 내 팔로워 목록
-   `GET /api/users/me/followings` - 내 팔로잉 목록

### 차단 (BLOCK)

-   `POST /api/users/:id/block` - 사용자 차단
-   `DELETE /api/users/users/:id/block` - 사용자 차단 해제
-   `GET /api/users/users/me/blocks` - 내 차단 목록

### 팀 (TEAM)

-   `POST /api/teams` - 팀 생성
-   `GET /api/teams/:id` - 팀 조회 (ID)
-   `GET /api/teams/name/:name` - 팀 조회 (이름)
-   `PATCH /api/teams/:id` - 팀 정보 수정
-   `POST /api/teams/:teamId/members/:memberId/invite` - 팀원 초대
-   `POST /api/teams/:id/join` - 팀 가입
-   `DELETE /api/teams/:id/leave` - 팀 탈퇴
-   `DELETE /api/teams/:id/kick` - 팀원 추방

### 파일 (FILE)

-   `POST /api/files/upload` - 파일 업로드

### 알림 (NOTICE)

-   `POST /api/notices` - 알림 생성 (Admin/System Only)
-   `GET /api/notices` - 알림 목록 조회 (페이징, 필터링)
-   `GET /api/notices/unread-count` - 읽지 않은 알림 개수
-   `PATCH /api/notices/:id/read` - 알림 읽음 처리
-   `PATCH /api/notices/read-all` - 모든 알림 읽음 처리
-   `DELETE /api/notices/:id` - 알림 삭제

---

## 📝 개발 노트

### 최근 업데이트 (2025-08-10)

-   NOTICE.md 신규 추가 - 알림 시스템 API
-   모든 controller 파일을 기반으로 API 명세서 업데이트
-   새로운 엔드포인트 추가 및 기존 명세서 정확성 개선
-   FILE.md 신규 추가
-   관리자 API 경로 수정 (/admin/users → /api/admin/users)
-   차단 API 경로 정확성 개선

### 주의사항

-   모든 인증이 필요한 API는 HttpOnly 쿠키로 JWT 토큰 전송
-   Rate Limiting이 적용된 엔드포인트 확인 필요
-   관리자 권한이 필요한 API는 AdminGuard 적용
-   파일 업로드 시 type query parameter로 저장 위치 결정
