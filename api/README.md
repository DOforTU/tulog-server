# TULOG API Server

> TULOG 프로젝트의 백엔드 API 서버입니다. NestJS 프레임워크를 기반으로 구축되었으며, PostgreSQL 데이터베이스와 Google OAuth 인증을 지원합니다.

## 기술 스택

- **Framework**: NestJS 11.0.1
- **Runtime**: Node.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: TypeORM 0.3.25
- **Authentication**:
  - Google OAuth 2.0 (passport-google-oauth20)
  - JWT (JSON Web Tokens)
- **Validation**: class-validator, class-transformer
- **Testing**: Jest
- **Code Quality**: ESLint, Prettier

## 주요 기능

- **사용자 관리**
  - 사용자 CRUD 작업
  - Soft Delete 지원 (isDeleted, deletedAt)
  - 사용자 복구 기능

- **인증 및 인가**
  - Google OAuth 2.0 로그인
  - JWT 토큰 기반 인증
  - 사용자 세션 관리

- **데이터베이스**
  - PostgreSQL 연동
  - TypeORM을 통한 엔티티 관리
  - 개발 환경에서 자동 동기화

- **정적 파일 서빙**
  - Google 로그인 테스트 페이지 제공
  - 개발용 UI 인터페이스

## 프로젝트 구조

```
src/
├── auth/                   # 인증 관련 모듈
│   ├── auth.controller.ts  # 인증 컨트롤러 (Google OAuth)
│   ├── auth.service.ts     # 인증 서비스 로직
│   ├── auth.module.ts      # 인증 모듈 설정
│   └── google.strategy.ts  # Google OAuth 전략
├── user/                   # 사용자 관리 모듈
│   ├── user.controller.ts  # 사용자 컨트롤러
│   ├── user.service.ts     # 사용자 비즈니스 로직
│   ├── user.repository.ts  # 사용자 데이터 액세스
│   ├── user.entity.ts      # 사용자 엔티티 정의
│   ├── user.dto.ts         # 데이터 전송 객체
│   └── user.module.ts      # 사용자 모듈 설정
├── app.controller.ts       # 애플리케이션 기본 컨트롤러
├── app.service.ts          # 애플리케이션 기본 서비스
├── app.module.ts           # 루트 모듈
└── main.ts                 # 애플리케이션 진입점
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 설정

`.env` 파일을 생성하고 필요한 환경 변수를 설정합니다:

```bash
cp .env.example .env
```

### 3. 애플리케이션 실행

```bash
# 개발 모드
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

서버가 시작되면 `http://localhost:8000`에서 접근할 수 있습니다.

## 환경 설정

### 필수 환경 변수

| 변수명                 | 설명                           |
| ---------------------- | ------------------------------ |
| `DB_HOST`              | 데이터베이스 호스트            |
| `DB_PORT`              | 데이터베이스 포트              |
| `DB_USERNAME`          | 데이터베이스 사용자명          |
| `DB_PASSWORD`          | 데이터베이스 비밀번호          |
| `DB_DATABASE`          | 데이터베이스 이름              |
| `DB_SCHEMA`            | 데이터베이스 스키마            |
| `JWT_SECRET`           | JWT 시크릿 키                  |
| `GOOGLE_CLIENT_ID`     | Google OAuth 클라이언트 ID     |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 클라이언트 시크릿 |
| `GOOGLE_CALLBACK_URL`  | Google OAuth 콜백 URL          |
| `FRONTEND_URL`         | 프론트엔드 URL                 |

## 개발

### 코드 품질

```bash
# 린팅
npm run lint

# 포맷팅
npm run format
```

### 테스트

```bash
# 단위 테스트
npm run test

# 테스트 커버리지
npm run test:cov

# E2E 테스트
npm run test:e2e
```

### 데이터베이스 마이그레이션

개발 환경에서는 `synchronize: true` 설정으로 자동 동기화됩니다.
프로덕션 환경에서는 마이그레이션을 사용하는 것을 권장합니다.

## API 문서

자세한 API 명세는 [API_DOC.md](./API_DOC.md)를 참조하세요.

### 주요 엔드포인트

- **Authentication**: `/auth/*`
- **Users**: `/users/*`
- **Health Check**: `/api/health`
- **Test Page**: `/` (Google 로그인 테스트 페이지)

## 개발 문서

자세한 개발 가이드는 아래 문서를 참조하세요:

- [코딩 표준](./docs/CODING_STANDARDS.md) - 함수명, 변수명, 파일명 규칙
- [커밋 규칙](./docs/COMMIT_RULES.md) - 커밋 메시지 작성 규칙
- [보안 가이드](./docs/SECURITY.md) - 보안 설정 및 관리 방법

## 라이선스

이 프로젝트는 UNLICENSED 하에 배포됩니다.
