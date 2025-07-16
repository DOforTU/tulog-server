# TULOG Server

> 대학교 로그 관리 시스템의 백엔드 서버

## 프로젝트 소개

개인 및 팀 블로그 서비스를 통해 지식과 경험을 기록하고 공유할 수 있는 플랫폼을 제공하기 위한 백엔드 API 서버입니다.

## 주요 기능

## 프로젝트 구조

```
tulog-server/
├── api/               # NestJS 애플리케이션
│   ├── docs/          # 개발 규칙 문서 (코딩 표준, 커밋 규칙, 보안 가이드)
│   ├── src/           # 소스 코드
│   ├── test/          # 테스트 파일
│   └── README.md      # 기술 문서 및 개발 가이드
├── docs/              # 프로젝트 설계 문서 (아키텍처, 요구사항, 명세서)
└── README.md          # 프로젝트 개요 (현재 파일)
```

## 기술 스택

-   **Backend**: NestJS, TypeScript
-   **Database**: TypeORM
-   **Validation**: class-validator, class-transformer
-   **Documentation**: Swagger (OpenAPI)
-   **Development**: ESLint, Jest

## 시작하기

자세한 설치 및 개발 가이드는 [api/README.md](./api/README.md)를 참조하세요.

```bash
# 프로젝트 클론
git clone https://github.com/DOforTU/tulog-server.git

# 의존성 설치 및 개발 서버 실행
cd tulog-server/api
npm install
npm run start:dev
```

## 개발 문서

자세한 개발 가이드는 아래 문서를 참조하세요:

-   [API 서버 개발 가이드](./api/README.md) - 기술 스택, 설치 및 실행 방법
-   [코딩 표준](./api/docs/CODING_STANDARDS.md) - 함수명, 변수명, 파일명 규칙
-   [커밋 규칙](./api/docs/COMMIT_RULES.md) - 커밋 메시지 작성 규칙
-   [보안 가이드](./api/docs/SECURITY.md) - 보안 설정 및 관리 방법

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
