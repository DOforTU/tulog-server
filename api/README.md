# TULOG Server API

## 프로젝트 구조

### api/ 폴더

- **NestJS 버전**: 11.0.1
- **TypeScript**: 5.x
- **Node.js**: 20.x

### 기술 스택

- **프레임워크**: NestJS 11.0.1
- **언어**: TypeScript
- **ORM**: TypeORM
- **문서화**: Swagger/OpenAPI
- **검증**: class-validator, class-transformer
- **설정**: @nestjs/config
- **개발 도구**: ESLint, Jest

### 개발 서버 실행

```bash
cd api
npm run start:dev
```

### 빌드

```bash
cd api
npm run build
```

### 테스트

```bash
cd api
npm run test
```

### 의존성 설치

```bash
cd api
npm install
```

### 주요 라이브러리

```bash
npm i --save @nestjs/swagger swagger-ui-express
npm i --save @nestjs/typeorm typeorm
npm i --save class-validator class-transformer
npm i --save @nestjs/config
```

### 주요 특징

- NestJS 11.0.1의 최신 기능 활용
- TypeORM을 통한 데이터베이스 연동
- Swagger를 통한 API 문서화
- class-validator를 통한 데이터 검증
- 모듈화된 아키텍처 구조
