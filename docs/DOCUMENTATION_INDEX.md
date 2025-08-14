# TULOG Server Documentation Index

> TULOG 서버 관련 문서들의 통합 인덱스입니다.

## 🏗️ 개선된 문서 구조

새로운 문서 구조는 기능별, 용도별로 체계화되어 더 직관적이고 접근하기 쉽습니다.

```
docs/
├── 📋 api-specification/     # API 명세서
├── 🏗️ architecture/          # 시스템 아키텍처
├── 🔄 pipelines/             # 비즈니스 로직 플로우
├── 🛠️ development/           # 개발 가이드라인
└── 🔒 private/               # 내부 문서
```

---

## 📋 API 명세서 (api-specification/)

완전하고 상세한 API 문서로 개발자가 바로 사용할 수 있는 실용적 정보를 제공합니다.

### 🔐 인증 시스템
- **[AUTH.md](./api-specification/AUTH.md)** - 인증 API (JWT, Google OAuth)

### 👤 사용자 관리
- **[USER.md](./api-specification/USER.md)** - 사용자 API (프로필, 계정 관리)
- **[USER_FOLLOW.md](./api-specification/USER_FOLLOW.md)** - 팔로우 API (팔로우/언팔로우)

### 🏢 팀 시스템
- **[TEAM.md](./api-specification/TEAM.md)** - 팀 API ⭐ **(알림 기반 팀 관리)**
- **[TEAM_FOLLOW.md](./api-specification/TEAM_FOLLOW.md)** - 팀 팔로우 API

### 📝 콘텐츠 관리
- **[POST.md](./api-specification/POST.md)** - 포스트 API ⭐ **(새로 추가됨)**
- **[EDITOR.md](./api-specification/EDITOR.md)** - 편집자 API ⭐ **(새로 추가됨)**

### 🔔 알림 시스템
- **[NOTICE.md](./api-specification/NOTICE.md)** - 알림 API ⭐ **(팀 연동 업데이트됨)**

### 🛡️ 보안 기능
- **[BLOCK.md](./api-specification/BLOCK.md)** - 차단 API

### 📁 파일 관리
- **[FILE.md](./api-specification/FILE.md)** - 파일 업로드 API

### 📖 가이드
- **[README.md](./api-specification/README.md)** - API 명세서 개요 및 사용법

---

## 🏗️ 시스템 아키텍처 (architecture/)

전체 시스템의 구조와 설계 원칙을 다루는 고수준 문서들입니다.

- **[MODULE_DEPENDENCIES.md](./architecture/MODULE_DEPENDENCIES.md)** - NestJS 모듈 간 의존성 관계 시각화
- **[ERD.md](./architecture/ERD.md)** - 데이터베이스 설계 및 엔티티 관계 다이어그램
- **[SECURITY.md](./architecture/SECURITY.md)** - 보안 정책 및 가이드라인

---

## 🔄 비즈니스 로직 파이프라인 (pipelines/)

각 기능의 상세한 비즈니스 로직과 플로우를 설명하는 실무 중심 문서들입니다.

### 🔐 인증 시스템
- **[GOOGLE_LOGIN_PIPELINE.md](./pipelines/GOOGLE_LOGIN_PIPELINE.md)** - Google OAuth 로그인 플로우
- **[JWT_AUTHENTICATION_PIPELINE.md](./pipelines/JWT_AUTHENTICATION_PIPELINE.md)** - JWT 인증 시스템
- **[LOCAL_LOGIN_PIPELINE.md](./pipelines/LOCAL_LOGIN_PIPELINE.md)** - 로컬 로그인 플로우

### 👥 사용자 관계 시스템
- **[FOLLOW_SYSTEM_PIPELINE.md](./pipelines/FOLLOW_SYSTEM_PIPELINE.md)** - 팔로우 시스템 파이프라인
- **[USER_BLOCK_SYSTEM_PIPELINE.md](./pipelines/USER_BLOCK_SYSTEM_PIPELINE.md)** - 사용자 차단 시스템

### 🏢 팀 관리 시스템
- **[TEAM_MANAGEMENT_PIPELINE.md](./pipelines/TEAM_MANAGEMENT_PIPELINE.md)** - 팀 관리 시스템 파이프라인 ⭐

### 📝 콘텐츠 관리 시스템
- **[POST_MANAGEMENT_PIPELINE.md](./pipelines/POST_MANAGEMENT_PIPELINE.md)** - 포스트 관리 시스템 ⭐ **(새로 추가됨)**

### 🔔 알림 시스템
- **[NOTICE_SYSTEM_PIPELINE.md](./pipelines/NOTICE_SYSTEM_PIPELINE.md)** - 알림 시스템 파이프라인

### 📁 파일 시스템
- **[FILE_UPLOAD_SYSTEM_PIPELINE.md](./pipelines/FILE_UPLOAD_SYSTEM_PIPELINE.md)** - 파일 업로드 시스템

### 📖 가이드
- **[README.md](./pipelines/README.md)** - 파이프라인 문서 개요

---

## 🛠️ 개발 가이드라인 (development/)

개발 시 준수해야 할 규칙과 컨벤션, 그리고 NestJS 고급 기능 사용법을 다룹니다.

### 📏 개발 규칙
- **[COMMIT_RULES.md](./development/COMMIT_RULES.md)** - 커밋 규칙 및 브랜치 전략
- **[FUNCTION_NAME.md](./development/FUNCTION_NAME.md)** - 함수 네이밍 컨벤션

### 🔧 NestJS 고급 기능
- **[GUARDS.md](./development/GUARDS.md)** - NestJS Guards 사용 가이드
- **[INTERCEPTORS.md](./development/INTERCEPTORS.md)** - NestJS Interceptors 사용 가이드
- **[MIDDLEWARE.md](./development/MIDDLEWARE.md)** - 미들웨어 구현 가이드
- **[FILTERS.md](./development/FILTERS.md)** - 예외 필터 구현 가이드

---

## 🆕 최근 주요 업데이트 (2025-08-15)

### ✨ 새로 추가된 기능

#### 📝 포스트 관리 시스템
- **다중 편집자 지원**: 한 포스트를 여러 사용자가 편집 가능
- **팀 포스트 협업**: 팀 포스트는 팀원 모두가 자동으로 편집자
- **상태 관리**: PUBLIC, PRIVATE, DRAFT 상태 지원
- **조회수 관리**: IP 기반 중복 조회 방지 시스템

#### 🔍 사용자별 포스트 조회
- **카테고리별 조회**: 공개/비공개/팀/드래프트별 포스트 조회
- **권한 기반 필터링**: 사용자 권한에 따른 포스트 접근 제어
- **팀 통합**: 팀 포스트와 개인 포스트 통합 관리

### 📝 새로 추가된 문서

- **[POST.md](./api-specification/POST.md)**: 포스트 CRUD API 완전 명세
- **[EDITOR.md](./api-specification/EDITOR.md)**: 사용자별 포스트 조회 API
- **[POST_MANAGEMENT_PIPELINE.md](./pipelines/POST_MANAGEMENT_PIPELINE.md)**: 포스트 관리 시스템 전체 플로우

### 🏗️ 문서 구조 개선

- **체계적 분류**: 기능별, 용도별 디렉토리 재구성
- **직관적 네이밍**: 더 명확한 폴더명과 파일명
- **접근성 향상**: 문서 간 연관성과 탐색 경로 개선

---

## 🎯 핵심 기능별 문서 가이드

### 🔐 인증 시스템
**아키텍처** → **파이프라인** → **API** 순으로 학습하세요.

1. **[JWT_AUTHENTICATION_PIPELINE.md](./pipelines/JWT_AUTHENTICATION_PIPELINE.md)** - JWT 토큰 전체 플로우
2. **[GOOGLE_LOGIN_PIPELINE.md](./pipelines/GOOGLE_LOGIN_PIPELINE.md)** - Google OAuth 구현
3. **[AUTH.md](./api-specification/AUTH.md)** - 인증 API 상세 명세

### 👥 사용자 관계 시스템
**비즈니스 로직** → **API 활용** 순으로 이해하세요.

1. **[FOLLOW_SYSTEM_PIPELINE.md](./pipelines/FOLLOW_SYSTEM_PIPELINE.md)** - 팔로우 시스템 동작 원리
2. **[USER_FOLLOW.md](./api-specification/USER_FOLLOW.md)** - 팔로우 API 사용법
3. **[USER_BLOCK_SYSTEM_PIPELINE.md](./pipelines/USER_BLOCK_SYSTEM_PIPELINE.md)** - 차단 시스템

### 🏢 팀 관리 시스템 ⭐
**최신 알림 기반 팀 관리 시스템**

1. **[TEAM_MANAGEMENT_PIPELINE.md](./pipelines/TEAM_MANAGEMENT_PIPELINE.md)** - 팀 관리 플로우
2. **[TEAM.md](./api-specification/TEAM.md)** - 팀 API 명세
3. **[NOTICE_SYSTEM_PIPELINE.md](./pipelines/NOTICE_SYSTEM_PIPELINE.md)** - 연동된 알림 시스템

### 📝 콘텐츠 관리 시스템 ⭐
**새로 구축된 포스트 관리 시스템**

1. **[POST_MANAGEMENT_PIPELINE.md](./pipelines/POST_MANAGEMENT_PIPELINE.md)** - 포스트 시스템 전체 구조
2. **[POST.md](./api-specification/POST.md)** - 포스트 CRUD API
3. **[EDITOR.md](./api-specification/EDITOR.md)** - 사용자별 포스트 조회 API

### 🔔 통합 알림 시스템 ⭐
**팀, 팔로우, 포스트와 연동된 알림 시스템**

1. **[NOTICE_SYSTEM_PIPELINE.md](./pipelines/NOTICE_SYSTEM_PIPELINE.md)** - 알림 시스템 구조
2. **[NOTICE.md](./api-specification/NOTICE.md)** - 알림 API 명세

---

## 🔍 문서 검색 가이드

### 기능별 빠른 검색

| 키워드 | 관련 문서 |
|--------|-----------|
| **인증** | `AUTH`, `JWT`, `GOOGLE_LOGIN` |
| **사용자** | `USER`, `FOLLOW`, `BLOCK` |
| **팀** | `TEAM`, `TEAM_MANAGEMENT`, `TEAM_MEMBER` |
| **포스트** | `POST`, `EDITOR`, `POST_MANAGEMENT` |
| **알림** | `NOTICE`, `NOTIFICATION` |
| **파일** | `FILE`, `UPLOAD` |

### 문서 타입별 검색

| 타입 | 디렉토리 | 용도 |
|------|----------|------|
| **API 사용법** | `api-specification/` | 즉시 사용 가능한 API 명세 |
| **시스템 설계** | `architecture/` | 전체 구조 이해 |
| **비즈니스 로직** | `pipelines/` | 기능 동작 원리 |
| **개발 규칙** | `development/` | 코딩 컨벤션 및 도구 사용법 |

---

## 📖 신규 개발자를 위한 문서 읽기 순서

### 1단계: 전체 시스템 이해 (30분)

1. **[MODULE_DEPENDENCIES.md](./architecture/MODULE_DEPENDENCIES.md)** - 전체 모듈 구조 파악
2. **[ERD.md](./architecture/ERD.md)** - 데이터베이스 설계 이해
3. **[README.md](./api-specification/README.md)** - API 전체 개요

### 2단계: 핵심 시스템 이해 (1시간)

1. **[JWT_AUTHENTICATION_PIPELINE.md](./pipelines/JWT_AUTHENTICATION_PIPELINE.md)** - 인증 시스템
2. **[USER.md](./api-specification/USER.md)** - 사용자 시스템
3. **[TEAM_MANAGEMENT_PIPELINE.md](./pipelines/TEAM_MANAGEMENT_PIPELINE.md)** - 팀 시스템
4. **[POST_MANAGEMENT_PIPELINE.md](./pipelines/POST_MANAGEMENT_PIPELINE.md)** - 포스트 시스템

### 3단계: 세부 기능 이해 (1시간)

1. **[NOTICE_SYSTEM_PIPELINE.md](./pipelines/NOTICE_SYSTEM_PIPELINE.md)** - 알림 시스템
2. **[FOLLOW_SYSTEM_PIPELINE.md](./pipelines/FOLLOW_SYSTEM_PIPELINE.md)** - 팔로우 시스템
3. **[FILE_UPLOAD_SYSTEM_PIPELINE.md](./pipelines/FILE_UPLOAD_SYSTEM_PIPELINE.md)** - 파일 시스템

### 4단계: 개발 규칙 숙지 (30분)

1. **[COMMIT_RULES.md](./development/COMMIT_RULES.md)** - 커밋 및 브랜치 규칙
2. **[FUNCTION_NAME.md](./development/FUNCTION_NAME.md)** - 코딩 컨벤션
3. **[SECURITY.md](./architecture/SECURITY.md)** - 보안 가이드라인

---

## 🤝 문서 기여 가이드

### 문서 업데이트 원칙

1. **기능 추가 시**: 파이프라인 문서 → API 명세서 순으로 작성
2. **API 변경 시**: API 명세서 우선 업데이트
3. **아키텍처 변경 시**: architecture/ 문서들 먼저 업데이트

### 문서 작성 스타일 가이드

- **Mermaid 다이어그램** 적극 활용
- **실제 코드 예제** 반드시 포함
- **에러 케이스** 및 **예외 상황** 명시
- **업데이트 날짜** 및 **변경 사항** 기록
- **cross-reference** 링크 활용

### 문서 품질 체크리스트

- [ ] 실제 동작하는 코드 예제 포함
- [ ] 에러 응답 예시 포함
- [ ] 권한 및 보안 요구사항 명시
- [ ] 관련 문서 링크 연결
- [ ] 업데이트 날짜 기록

---

## 📊 문서 통계

| 카테고리 | 문서 수 | 상태 | 최근 업데이트 |
|----------|---------|------|---------------|
| **API 명세서** | 9개 | ✅ 완료 | 2025-08-15 |
| **아키텍처** | 3개 | ✅ 완료 | 2025-08-10 |
| **파이프라인** | 8개 | ✅ 완료 | 2025-08-15 |
| **개발 가이드** | 6개 | ✅ 완료 | 2025-08-10 |
| **총 문서 수** | **26개** | **100%** | **2025-08-15** |

---

## 🔗 중요 링크

### 개발 환경
- **API 서버**: `http://localhost:3000`
- **Swagger UI**: `http://localhost:3000/api`
- **데이터베이스**: PostgreSQL

### 외부 의존성
- **Google OAuth**: Google Cloud Console 설정 필요
- **파일 스토리지**: AWS S3 호환 스토리지
- **알림 시스템**: 실시간 WebSocket 연결

---

_Last Updated: 2025-08-15_  
_Total Documents: 26 files_  
_Key Features: Post Management, Team Collaboration, Multi-Editor Support, Notice Integration_  
_Documentation Structure: Improved & Reorganized_