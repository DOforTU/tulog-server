# Notice 모듈 개발 문서

## 📝 개발 개요

TULOG 프로젝트에 알림 시스템(Notice System)을 추가하여 사용자들이 중요한 이벤트들을 놓치지 않도록 하는 기능을 구현했습니다.

## 🎯 구현 목표

- **실시간 알림**: 팔로우, 팀 관련 이벤트 등에 대한 즉시 알림
- **체계적 분류**: 6가지 알림 타입으로 구조화된 알림 관리
- **효율적 조회**: 페이징과 필터링을 통한 빠른 알림 조회
- **사용자 중심**: 읽음/미읽음 상태 관리 및 개인화된 알림

## 📁 생성된 파일 목록

### Core Files

1. **`notice.entity.ts`** - Notice 엔티티 정의
2. **`notice.dto.ts`** - DTO 클래스 (Create, Update, Query)
3. **`notice.repository.ts`** - 데이터 액세스 레이어
4. **`notice.service.ts`** - 비즈니스 로직 레이어
5. **`notice.controller.ts`** - REST API 엔드포인트
6. **`notice.module.ts`** - NestJS 모듈 설정

### Documentation

7. **`NOTICE.md`** - API 명세서 (수정됨)
8. **`NOTICE_SYSTEM_PIPELINE.md`** - 시스템 파이프라인 문서
9. **`README.md`** - 이 파일 (개발 문서)

### Configuration Changes

10. **`app.module.ts`** - Notice 모듈 및 엔티티 추가

## 🔔 알림 타입 시스템

### 구현된 6가지 알림 타입

```typescript
export enum NoticeType {
  FOLLOW = 'follow', // 새로운 팔로워
  TEAM_INVITE = 'team_invite', // 팀 초대
  TEAM_JOIN = 'team_join', // 팀원 가입 (팀장에게)
  TEAM_LEAVE = 'team_leave', // 팀원 탈퇴 (팀장에게)
  TEAM_KICK = 'team_kick', // 팀에서 추방
  SYSTEM = 'system', // 시스템 공지
}
```

### 각 타입별 동작

#### FOLLOW

- **트리거**: 사용자 A가 사용자 B를 팔로우
- **수신자**: 사용자 B
- **메시지**: "{닉네임}님이 회원님을 팔로우하기 시작했습니다."
- **관련 엔티티**: 팔로우한 사용자 ID

#### TEAM_INVITE

- **트리거**: 팀장이 사용자를 팀에 초대
- **수신자**: 초대받은 사용자
- **메시지**: "{팀장닉네임}님이 '{팀명}' 팀에 초대했습니다."
- **관련 엔티티**: 팀 ID

#### TEAM_JOIN

- **트리거**: 새로운 멤버가 팀에 가입
- **수신자**: 팀장
- **메시지**: "{닉네임}님이 '{팀명}' 팀에 가입했습니다."
- **관련 엔티티**: 팀 ID

#### TEAM_LEAVE

- **트리거**: 팀원이 팀을 탈퇴
- **수신자**: 팀장
- **메시지**: "{닉네임}님이 '{팀명}' 팀을 탈퇴했습니다."
- **관련 엔티티**: 팀 ID

#### TEAM_KICK

- **트리거**: 팀장이 멤버를 추방
- **수신자**: 추방당한 멤버
- **메시지**: "'{팀명}' 팀에서 제명되었습니다."
- **관련 엔티티**: 팀 ID

#### SYSTEM

- **트리거**: 관리자가 시스템 공지 생성
- **수신자**: 지정된 사용자
- **메시지**: 관리자가 설정한 내용
- **관련 엔티티**: 없음

## 🗄️ 데이터베이스 스키마

### Notice Entity 필드

```sql
CREATE TABLE notice (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES user(id),
  type VARCHAR(20) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  related_entity_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 성능 최적화 인덱스

```sql
-- 사용자별 알림 조회 (페이징)
CREATE INDEX idx_notice_user_created ON notice(user_id, created_at);

-- 미읽음 알림 필터링
CREATE INDEX idx_notice_user_read ON notice(user_id, is_read);
```

## 🚀 API 엔드포인트

### 구현된 REST API

```
POST   /api/notices              # 알림 생성 (Admin/System Only)
GET    /api/notices              # 알림 목록 조회 (페이징, 필터)
GET    /api/notices/unread-count # 미읽음 알림 개수
PATCH  /api/notices/:id/read     # 알림 읽음 처리
PATCH  /api/notices/read-all     # 모든 알림 읽음 처리
DELETE /api/notices/:id          # 알림 삭제
```

### 주요 기능

- **페이징**: 기본 20개, 최대 100개 제한
- **필터링**: 읽음상태, 알림타입별 필터
- **보안**: JWT 인증, 사용자 소유권 검증
- **성능**: 인덱싱을 통한 빠른 조회

## 🔒 보안 및 검증

### 접근 제어

- **JWT 인증**: 모든 엔드포인트에서 JWT 토큰 필수
- **소유권 검증**: 사용자는 자신의 알림만 조회/수정/삭제 가능
- **입력 검증**: DTO를 통한 철저한 입력값 검증

### 데이터 보호

- **닉네임 사용**: 실명(name) 대신 닉네임(nickname) 사용으로 개인정보 보호
- **메타데이터**: 민감하지 않은 추가 정보만 JSON으로 저장

## 📈 성능 최적화

### 데이터베이스 레벨

- **복합 인덱스**: (user_id, is_read), (user_id, created_at)
- **적절한 데이터 타입**: 효율적인 저장과 조회
- **페이징**: 대용량 데이터 처리

### 애플리케이션 레벨

- **트랜잭션**: 연관 작업들의 원자성 보장
- **배치 처리**: 다중 알림 생성 시 성능 최적화
- **자동 정리**: 오래된 알림 삭제 기능

## 🔧 주요 설계 결정사항

### 1. relatedEntityType 제거

- **기존**: `relatedEntityType` + `relatedEntityId` 두 필드 사용
- **변경**: `type` 열거형으로 충분하므로 `relatedEntityType` 제거
- **이유**: 중복성 제거, 데이터 일관성 향상, 쿼리 성능 개선

### 2. 닉네임 사용

- **기존**: 사용자 실명(name) 사용
- **변경**: 사용자 닉네임(nickname) 사용
- **이유**: 개인정보 보호, 사용자 경험 개선

### 3. 메타데이터 활용

- **목적**: 향후 확장성을 위한 구조화된 데이터 저장
- **형태**: JSONB 타입으로 유연한 데이터 저장
- **활용**: 알림 클릭 시 필요한 추가 정보 저장

## 🔄 통합 가이드

### 다른 서비스와의 연동

#### Follow Service 연동

```typescript
// follow.service.ts에서 팔로우 시
await this.noticeService.createFollowNotice(
  targetUserId,
  followerId,
  follower.nickname,
);
```

#### Team Service 연동

```typescript
// team.service.ts에서 팀 이벤트 시
await this.noticeService.createTeamInviteNotice(
  userId,
  teamId,
  teamName,
  inviter.nickname,
);
```

### 의존성 주입

```typescript
// 서비스에서 NoticeService 사용
constructor(
  private readonly noticeService: NoticeService,
) {}
```

## 🧪 테스트 전략

### 단위 테스트

- NoticeService 메서드별 테스트
- NoticeRepository CRUD 테스트
- DTO 검증 테스트

### 통합 테스트

- API 엔드포인트 테스트
- 데이터베이스 연동 테스트
- 인증/인가 테스트

### E2E 테스트

- 전체 알림 플로우 테스트
- 다른 서비스와의 연동 테스트

## 🔮 향후 개발 계획

### Phase 2: 실시간 알림

- WebSocket을 통한 실시간 푸시
- 브라우저 알림 API 연동
- 모바일 푸시 알림

### Phase 3: 고급 기능

- 알림 템플릿 시스템
- 사용자별 알림 설정
- 알림 통계 및 분석

### Phase 4: 확장 기능

- 이메일 알림
- SMS 알림
- 다국어 지원

## 🐛 알려진 이슈 및 제한사항

### 현재 제한사항

1. **실시간 푸시 없음**: 현재는 폴링 방식으로 확인 필요
2. **알림 설정 없음**: 모든 알림이 기본적으로 활성화
3. **다국어 미지원**: 한국어 메시지만 지원

### 해결 예정

- 실시간 알림은 WebSocket 도입으로 해결 예정
- 사용자 설정 테이블 추가로 알림 제어 기능 구현 예정

## 📚 참고 자료

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [JWT Authentication Guide](https://jwt.io/)
- [REST API Best Practices](https://restfulapi.net/)

---

**개발 완료일**: 2025년 8월 10일  
**개발자**: GitHub Copilot  
**버전**: 1.0.0
