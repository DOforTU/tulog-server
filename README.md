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

## 커밋 규칙

### 커밋 타입

| 타입         | 설명                                       | 예시                                    |
| ------------ | ------------------------------------------ | --------------------------------------- |
| `[ADD]`      | 새로운 기능, API 엔드포인트 추가           | `[ADD] 사용자 인증 API 구현`            |
| `[UPDATE]`   | 기존 기능 개선, API 수정                   | `[UPDATE] JWT 토큰 만료 시간 연장`      |
| `[FIX]`      | 버그 수정, 오류 해결                       | `[FIX] 데이터베이스 연결 오류 수정`     |
| `[REFACTOR]` | 코드 리팩토링 (기능 변경 없음)             | `[REFACTOR] 인증 로직을 서비스로 분리`  |
| `[REMOVE]`   | 파일, 코드, 기능 삭제                      | `[REMOVE] 사용하지 않는 미들웨어 삭제`  |
| `[DOCS]`     | 문서 작성, 수정                            | `[DOCS] API 명세서 업데이트`            |
| `[CONFIG]`   | 설정 파일 변경 (package.json, 환경변수 등) | `[CONFIG] 데이터베이스 연결 설정 변경`  |
| `[TEST]`     | 테스트 코드 작성, 수정                     | `[TEST] 사용자 서비스 단위 테스트 추가` |
| `[SECURITY]` | 보안 관련 개선, 취약점 수정                | `[SECURITY] SQL 인젝션 방어 코드 추가`  |
| `[PERF]`     | 성능 개선                                  | `[PERF] 데이터베이스 쿼리 최적화`       |
| `[DEPLOY]`   | 배포 관련 작업                             | `[DEPLOY] Docker 설정 추가`             |

### 작성 가이드라인

1. **제목은 50자 이내**로 간결하게 작성
2. **현재형 동사** 사용 (추가했다 ❌, 추가 ✅)
3. **첫 글자는 대문자**로 시작
4. **마침표(.)는 생략**

### 커밋 예시

```bash
# 새로운 기능 추가
[ADD] Google OAuth 로그인 API 구현
[ADD] 블로그 포스트 CRUD 엔드포인트 추가

# 기존 기능 개선
[UPDATE] 사용자 권한 검증 로직 개선
[UPDATE] 응답 형식 표준화

# 버그 수정
[FIX] 토큰 갱신 시 무한 루프 오류
[FIX] 데이터베이스 트랜잭션 롤백 실패

# 리팩토링
[REFACTOR] 컨트롤러에서 비즈니스 로직을 서비스로 분리
[REFACTOR] 공통 에러 처리 로직 중앙화

# 보안 개선
[SECURITY] JWT 토큰 HttpOnly 쿠키 적용
[SECURITY] Rate Limiting 미들웨어 추가

# 성능 개선
[PERF] 데이터베이스 인덱스 최적화
[PERF] 응답 압축 미들웨어 적용

# 테스트
[TEST] 인증 가드 단위 테스트 추가
[TEST] API 엔드포인트 E2E 테스트 구현

# 설정 변경
[CONFIG] NestJS 10 업그레이드
[CONFIG] TypeORM 마이그레이션 설정
```

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.
