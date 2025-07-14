# TULOG Server

> 대학교 로그 관리 시스템의 백엔드 서버

## 프로젝트 소개

개인 및 팀 블로그 서비스를 통해 지식과 경험을 기록하고 공유할 수 있는 플랫폼을 제공하기 위한 백엔드 API 서버입니다.

## 주요 기능

## 프로젝트 구조

```
tulog-server/
├── api/               # NestJS 애플리케이션
│   ├── src/           # 소스 코드
│   ├── test/          # 테스트 파일
│   └── README.md      # 기술 문서 및 개발 가이드
├── docs/              # 문서
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

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
