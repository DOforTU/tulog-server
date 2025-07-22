# 커밋 규칙

## 커밋 메시지 구조

```
[TYPE] 제목

본문 (선택사항)

푸터 (선택사항)
```

## 커밋 타입

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

## 작성 가이드라인

### 제목 규칙

1. **50자 이내**로 간결하게 작성
2. **현재형 동사** 사용 (추가했다 ❌, 추가 ✅)
3. **첫 글자는 대문자**로 시작
4. **마침표(.)는 생략**

### 본문 규칙

1. **72자에서 줄바꿈**
2. **무엇을, 왜 변경했는지** 설명
3. **어떻게 변경했는지**보다는 **왜 변경했는지** 중심으로 작성

## 커밋 예시

### 기본 커밋

```bash
[ADD] Google OAuth 로그인 API 구현
[UPDATE] 사용자 권한 검증 로직 개선
[FIX] 토큰 갱신 시 무한 루프 오류
[REFACTOR] 컨트롤러에서 비즈니스 로직을 서비스로 분리
```

### 상세 커밋

```bash
[SECURITY] JWT 토큰 HttpOnly 쿠키 적용

XSS 공격 방어를 위해 JWT 토큰을 HttpOnly 쿠키에 저장하도록 변경

- 기존: localStorage에 토큰 저장
- 변경: HttpOnly 쿠키에 토큰 저장
- 쿠키 설정: secure, sameSite 속성 추가
```

## 브랜치 규칙

### 브랜치 명명

```
feature/user-authentication
bugfix/token-refresh-loop
hotfix/security-vulnerability
refactor/service-layer-separation
```

### 브랜치 종류

- `main`: 배포 가능한 상태
- `develop`: 개발 중인 상태
- `feature/*`: 새로운 기능 개발
- `bugfix/*`: 버그 수정
- `hotfix/*`: 긴급 수정
- `refactor/*`: 코드 리팩토링
