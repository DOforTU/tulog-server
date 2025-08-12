# TULOG Server Documentation Index

> TULOG 서버 관련 문서들의 통합 인덱스입니다.

## 📚 문서 구조

### 🏗️ 아키텍처 문서

-   **[MODULE_DEPENDENCIES.md](./MODULE_DEPENDENCIES.md)** - NestJS 모듈 간 의존성 관계 시각화
-   **[SECURITY.md](./SECURITY.md)** - 보안 정책 및 가이드라인

### 🔄 파이프라인 문서 ([pipelines/](./pipelines/))

-   **[GOOGLE_LOGIN_PIPELINE.md](./pipelines/GOOGLE_LOGIN_PIPELINE.md)** - Google OAuth 로그인 플로우
-   **[JWT_AUTHENTICATION_PIPELINE.md](./pipelines/JWT_AUTHENTICATION_PIPELINE.md)** - JWT 인증 시스템
-   **[LOCAL_LOGIN_PIPELINE.md](./pipelines/LOCAL_LOGIN_PIPELINE.md)** - 로컬 로그인 플로우
-   **[FOLLOW_SYSTEM_PIPELINE.md](./pipelines/FOLLOW_SYSTEM_PIPELINE.md)** - 팔로우 시스템 파이프라인
-   **[TEAM_MANAGEMENT_PIPELINE.md](./pipelines/TEAM_MANAGEMENT_PIPELINE.md)** - 팀 관리 시스템 파이프라인 ⭐
-   **[NOTICE_SYSTEM_PIPELINE.md](./pipelines/NOTICE_SYSTEM_PIPELINE.md)** - 알림 시스템 파이프라인
-   **[USER_BLOCK_SYSTEM_PIPELINE.md](./pipelines/USER_BLOCK_SYSTEM_PIPELINE.md)** - 사용자 차단 시스템
-   **[FILE_UPLOAD_SYSTEM_PIPELINE.md](./pipelines/FILE_UPLOAD_SYSTEM_PIPELINE.md)** - 파일 업로드 시스템

### 📋 API 명세서 ([api-specification/](./api-specification/))

-   **[README.md](./api-specification/README.md)** - API 명세서 개요
-   **[AUTH.md](./api-specification/AUTH.md)** - 인증 API
-   **[USER.md](./api-specification/USER.md)** - 사용자 API
-   **[FOLLOW.md](./api-specification/USER_FOLLOW.md)** - 팔로우 API
-   **[TEAM.md](./api-specification/TEAM.md)** - 팀 API ⭐ **(업데이트됨)**
-   **[NOTICE.md](./api-specification/NOTICE.md)** - 알림 API ⭐ **(업데이트됨)**
-   **[BLOCK.md](./api-specification/BLOCK.md)** - 차단 API
-   **[FILE.md](./api-specification/FILE.md)** - 파일 업로드 API

### 🛠️ 개발 가이드라인

-   **[COMMIT_RULES.md](./COMMIT_RULES.md)** - 커밋 규칙 및 브랜치 전략
-   **[FUNCTION_NAME.md](./FUNCTION_NAME.md)** - 함수 네이밍 컨벤션
-   **[GUARDS.md](./GUARDS.md)** - NestJS Guards 사용 가이드
-   **[INTERCEPTORS.md](./INTERCEPTORS.md)** - NestJS Interceptors 사용 가이드
-   **[MIDDLEWARE.md](./MIDDLEWARE.md)** - 미들웨어 구현 가이드
-   **[FILTERS.md](./FILTERS.md)** - 예외 필터 구현 가이드

---

## 🆕 최근 업데이트 (2025-08-10)

### ✨ 새로 추가된 문서

-   **MODULE_DEPENDENCIES.md**: NestJS 모듈 간 의존성 관계를 Mermaid 다이어그램으로 시각화
-   **알림 기반 팀 관리 시스템**: 팀 초대/참여 요청에 대한 자동 알림 및 액션 시스템

### 📝 업데이트된 문서

-   **TEAM_MANAGEMENT_PIPELINE.md**:

    -   팀 초대 시스템 (INVITED 상태)
    -   팀 참여 요청 시스템 (PENDING 상태)
    -   알림 기반 액션 처리 플로우
    -   상태 다이어그램 및 시퀀스 다이어그램 추가

-   **TEAM.md (API 명세서)**:

    -   새로운 알림 기반 팀 액션 엔드포인트 추가
    -   팀멤버 상태 관리 시스템 문서화
    -   상태 플로우 다이어그램 추가

-   **NOTICE.md (API 명세서)**:
    -   팀 관련 알림 타입 상세 설명
    -   알림 통합 플로우 다이어그램
    -   실제 사용 예제 확장

---

## 🎯 핵심 기능별 문서 가이드

### 🔐 인증 시스템

1. **[GOOGLE_LOGIN_PIPELINE.md](./pipelines/GOOGLE_LOGIN_PIPELINE.md)** - Google OAuth 구현
2. **[JWT_AUTHENTICATION_PIPELINE.md](./pipelines/JWT_AUTHENTICATION_PIPELINE.md)** - JWT 토큰 관리
3. **[AUTH.md](./api-specification/AUTH.md)** - 인증 API 명세

### 👥 사용자 관계 시스템

1. **[FOLLOW_SYSTEM_PIPELINE.md](./pipelines/FOLLOW_SYSTEM_PIPELINE.md)** - 팔로우 시스템
2. **[USER_FOLLOW.md](./api-specification/USER_FOLLOW.md)** - 팔로우 API
3. **[USER_BLOCK_SYSTEM_PIPELINE.md](./pipelines/USER_BLOCK_SYSTEM_PIPELINE.md)** - 차단 시스템

### 🏢 팀 관리 시스템 ⭐

1. **[TEAM_MANAGEMENT_PIPELINE.md](./pipelines/TEAM_MANAGEMENT_PIPELINE.md)** - 팀 관리 플로우
2. **[TEAM.md](./api-specification/TEAM.md)** - 팀 API 명세
3. **[MODULE_DEPENDENCIES.md](./MODULE_DEPENDENCIES.md)** - 팀 관련 모듈 의존성

### 🔔 알림 시스템 ⭐

1. **[NOTICE_SYSTEM_PIPELINE.md](./pipelines/NOTICE_SYSTEM_PIPELINE.md)** - 알림 시스템 구조
2. **[NOTICE.md](./api-specification/NOTICE.md)** - 알림 API 명세
3. **알림 통합 시스템**: 팔로우, 팀 초대, 팀 참여 자동 알림

---

## 🔍 문서 검색 가이드

### 기능별 검색

-   **인증 관련**: `AUTH`, `JWT`, `GOOGLE_LOGIN`
-   **사용자 관련**: `USER`, `FOLLOW`, `BLOCK`
-   **팀 관련**: `TEAM`, `TEAM_MANAGEMENT`, `TEAM_MEMBER`
-   **알림 관련**: `NOTICE`, `NOTIFICATION`
-   **파일 관련**: `FILE`, `UPLOAD`

### 문서 타입별 검색

-   **파이프라인**: `pipelines/`
-   **API 명세**: `api-specification/`
-   **아키텍처**: `MODULE_DEPENDENCIES.md`
-   **가이드라인**: `COMMIT_RULES.md`, `FUNCTION_NAME.md`, etc.

---

## 📖 문서 읽기 순서 (신규 개발자용)

### 1단계: 전체 아키텍처 이해

1. **[MODULE_DEPENDENCIES.md](./MODULE_DEPENDENCIES.md)** - 전체 모듈 구조 파악
2. **[README.md](./api-specification/README.md)** - API 전체 개요

### 2단계: 핵심 시스템 이해

1. **[JWT_AUTHENTICATION_PIPELINE.md](./pipelines/JWT_AUTHENTICATION_PIPELINE.md)** - 인증 시스템
2. **[USER.md](./api-specification/USER.md)** - 사용자 시스템
3. **[TEAM_MANAGEMENT_PIPELINE.md](./pipelines/TEAM_MANAGEMENT_PIPELINE.md)** - 팀 시스템
4. **[NOTICE_SYSTEM_PIPELINE.md](./pipelines/NOTICE_SYSTEM_PIPELINE.md)** - 알림 시스템

### 3단계: 개발 규칙 숙지

1. **[COMMIT_RULES.md](./COMMIT_RULES.md)** - 커밋 및 브랜치 규칙
2. **[FUNCTION_NAME.md](./FUNCTION_NAME.md)** - 코딩 컨벤션
3. **[SECURITY.md](./SECURITY.md)** - 보안 가이드라인

---

## 🤝 문서 기여 가이드

### 문서 업데이트 규칙

1. **기능 추가 시**: 해당 파이프라인 문서와 API 명세서 동시 업데이트
2. **API 변경 시**: API 명세서 우선 업데이트 후 파이프라인 문서 반영
3. **아키텍처 변경 시**: MODULE_DEPENDENCIES.md 먼저 업데이트

### 문서 작성 스타일

-   **Mermaid 다이어그램** 적극 활용
-   **실제 코드 예제** 포함
-   **에러 케이스** 및 **예외 상황** 명시
-   **업데이트 날짜** 및 **변경 사항** 기록

---

_Last Updated: 2025-08-10_  
_Total Documents: 20+ files_  
_Key Features: Team Management, Notice System, Authentication, Follow System_
