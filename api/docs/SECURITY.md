# 보안 가이드

## 인증 시스템 개요

TULOG는 JWT 토큰 + HttpOnly 쿠키를 결합한 하이브리드 인증 방식을 사용합니다.

## 토큰 관리

### 토큰 종류

| 토큰 종류     | 만료 시간 | 저장 위치     | 용도              |
| ------------- | --------- | ------------- | ----------------- |
| Access Token  | 15분      | HttpOnly 쿠키 | API 요청 인증     |
| Refresh Token | 30일      | HttpOnly 쿠키 | Access Token 갱신 |

### 쿠키 보안 설정

```typescript
res.cookie('accessToken', token, {
  httpOnly: true, // XSS 공격 방어
  secure: true, // HTTPS에서만 전송
  sameSite: 'strict', // CSRF 공격 방어
  maxAge: 15 * 60 * 1000, // 15분 만료
});
```

## 보안 취약점 방어

### XSS (Cross-Site Scripting) 방어

- **HttpOnly 쿠키**: JavaScript 접근 차단
- **Content Security Policy**: 스크립트 실행 제한
- **입력 검증**: 사용자 입력 데이터 검증

### CSRF (Cross-Site Request Forgery) 방어

- **SameSite 쿠키**: 동일 사이트에서만 전송
- **CSRF 토큰**: 상태 변경 요청 시 토큰 검증
- **Origin 헤더 검증**: 요청 출처 확인

### SQL 인젝션 방어

- **ORM 사용**: TypeORM의 매개변수화된 쿼리
- **입력 검증**: class-validator를 통한 데이터 검증
- **권한 분리**: 데이터베이스 권한 최소화

## 환경 변수 관리

### 민감 정보 관리

```bash
# 절대 커밋하지 말 것
JWT_SECRET=your-secret-key
DB_PASSWORD=your-db-password
GOOGLE_CLIENT_SECRET=your-google-secret
```

### 환경별 설정

```bash
# 개발환경
NODE_ENV=development
DB_SSL=false

# 프로덕션환경
NODE_ENV=production
DB_SSL=true
```

## API 보안

### Rate Limiting

```typescript
@UseGuards(RateLimitGuard)
@Controller('auth')
export class AuthController {
  // 로그인 시도 제한
}
```

### 입력 검증

```typescript
@Post('users')
async createUser(@Body() createUserDto: CreateUserDto) {
  // class-validator로 자동 검증
}
```

### 인증 가드

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

## 로깅 및 모니터링

### 보안 이벤트 로깅

- 로그인 시도 (성공/실패)
- 토큰 갱신 요청
- 권한 없는 접근 시도
- 비정상적인 요청 패턴

### 모니터링 대상

- 실패한 인증 시도 빈도
- 토큰 갱신 패턴
- API 응답 시간
- 에러 발생 빈도

## 배포 보안

### HTTPS 필수

```typescript
// 프로덕션 환경에서만 secure 쿠키
secure: process.env.NODE_ENV === 'production';
```

### 보안 헤더

```typescript
// 보안 헤더 설정
app.use(helmet());
```

### 의존성 보안

```bash
# 정기적인 보안 업데이트
npm audit
npm audit fix
```

## 사고 대응

### 토큰 탈취 시 대응

1. 해당 사용자의 모든 토큰 무효화
2. 강제 로그아웃 처리
3. 사용자에게 보안 알림
4. 로그 분석 및 추가 피해 확인

### 데이터 유출 시 대응

1. 즉시 서버 차단
2. 유출 범위 파악
3. 관련 기관 신고
4. 사용자 공지 및 대응 안내

## 정기 보안 점검

### 월별 점검 사항

- 의존성 패키지 보안 업데이트
- 로그 분석 및 이상 패턴 확인
- 토큰 만료 시간 적절성 검토

### 분기별 점검 사항

- 전체 보안 설정 검토
- 침투 테스트 수행
- 보안 정책 업데이트

## 참고 자료

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-jwt-bcp)
- [NestJS Security](https://docs.nestjs.com/security/authentication)
