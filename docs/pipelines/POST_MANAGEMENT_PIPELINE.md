# Post Management System Pipeline

> 포스트 생성, 수정, 삭제 및 팀 협업 시스템의 전체 플로우를 정의합니다.

## 📋 목차

- [시스템 개요](#시스템-개요)
- [포스트 생성 플로우](#포스트-생성-플로우)
- [팀 포스트 시스템](#팀-포스트-시스템)
- [Editor 시스템](#editor-시스템)
- [태그 관리 시스템](#태그-관리-시스템)
- [포스트 조회 시스템](#포스트-조회-시스템)
- [권한 관리](#권한-관리)

---

## 시스템 개요

TULOG의 포스트 관리 시스템은 개인 블로그와 팀 블로그를 동시에 지원하는 하이브리드 구조입니다.

### 핵심 특징

- **다중 편집자 지원**: 한 포스트를 여러 사용자가 편집 가능
- **팀 협업**: 팀 포스트는 팀원 모두가 자동으로 편집자가 됨
- **상태 관리**: PUBLIC, PRIVATE, DRAFT 상태 지원
- **태그 시스템**: 자동 태그 생성 및 관리
- **조회수 관리**: IP 기반 중복 조회 방지

---

## 포스트 생성 플로우

```mermaid
flowchart TD
    A[사용자가 포스트 생성 요청] --> B{팀 포스트인가?}
    
    B -->|개인 포스트| C[Post 테이블에 저장]
    B -->|팀 포스트| D[Post 테이블에 저장<br/>teamId 포함]
    
    C --> E[Editor 테이블에 생성자만 OWNER로 추가]
    D --> F[팀의 모든 JOINED 멤버를<br/>Editor에 추가]
    
    F --> G[생성자: OWNER 역할]
    F --> H[다른 팀원: EDITOR 역할]
    
    E --> I[태그 처리]
    G --> I
    H --> I
    
    I --> J{새로운 태그가 있는가?}
    J -->|있음| K[Tag 테이블에 새 태그 생성]
    J -->|없음| L[기존 태그 사용]
    
    K --> M[PostTag 관계 테이블에 연결]
    L --> M
    
    M --> N[트랜잭션 커밋]
    N --> O[생성된 포스트 반환]
```

### 트랜잭션 처리

모든 포스트 생성은 다음 순서로 트랜잭션 내에서 처리됩니다:

1. **Post 엔티티 생성**
2. **Editor 관계 설정**
3. **Tag 생성/연결**
4. **트랜잭션 커밋**

실패 시 모든 변경사항이 롤백됩니다.

---

## 팀 포스트 시스템

### 팀 포스트 생성 시퀀스

```mermaid
sequenceDiagram
    participant U as User
    participant PC as PostController
    participant PS as PostService
    participant TMS as TeamMemberService
    participant DB as Database
    
    U->>PC: POST /api/posts (with teamId)
    PC->>PS: createPost(dto, userId)
    
    PS->>DB: Post 저장
    PS->>TMS: getJoinedTeamMembersByTeamId(teamId)
    TMS-->>PS: 팀 멤버 목록 반환
    
    loop 각 팀 멤버에 대해
        alt 생성자인 경우
            PS->>DB: Editor 저장 (OWNER 역할)
        else 다른 팀원인 경우
            PS->>DB: Editor 저장 (EDITOR 역할)
        end
    end
    
    PS->>PS: 태그 처리
    PS-->>PC: 생성된 포스트 반환
    PC-->>U: 포스트 정보 응답
```

### 팀 멤버십 변경 시 Editor 업데이트

현재는 포스트 생성 시점의 팀 멤버만 Editor에 추가되며, 이후 팀 멤버십 변경은 자동 반영되지 않습니다.

**향후 개선 사항:**
- 팀 멤버 추가 시 기존 팀 포스트의 Editor에도 자동 추가
- 팀 멤버 제거 시 해당 사용자의 Editor 권한 제거

---

## Editor 시스템

### Editor 역할 정의

```mermaid
classDiagram
    class EditorRole {
        <<enumeration>>
        OWNER
        EDITOR
    }
    
    class Editor {
        +postId: number
        +userId: number
        +role: EditorRole
        +createdAt: Date
    }
    
    class Post {
        +id: number
        +title: string
        +content: string
        +status: PostStatus
        +teamId?: number
    }
    
    class User {
        +id: number
        +nickname: string
        +profilePicture: string
    }
    
    Editor --> Post : belongs to
    Editor --> User : belongs to
    Editor --> EditorRole : has
```

### 권한 매트릭스

| 작업 | OWNER | EDITOR | 비편집자 |
|------|-------|--------|----------|
| 포스트 조회 | ✅ | ✅ | 상태에 따라 |
| 포스트 수정 | ✅ | ✅ | ❌ |
| 포스트 삭제 | ✅ | ✅ | ❌ |
| Editor 추가/제거 | ✅ | ❌ | ❌ |

---

## 태그 관리 시스템

### 태그 자동 생성 플로우

```mermaid
flowchart TD
    A[태그 목록 받음] --> B[각 태그명에 대해]
    B --> C{Tag 테이블에<br/>해당 태그 존재?}
    
    C -->|존재함| D[기존 Tag 사용]
    C -->|존재하지 않음| E[새 Tag 생성]
    
    D --> F[PostTag 관계 생성]
    E --> F
    
    F --> G{더 처리할 태그?}
    G -->|있음| B
    G -->|없음| H[태그 처리 완료]
```

### 태그 수정 처리

포스트 수정 시 태그 변경은 다음과 같이 처리됩니다:

1. **기존 PostTag 관계 모두 삭제**
2. **새로운 태그 목록으로 PostTag 재생성**
3. **고아 태그는 유지** (다른 포스트에서 사용 중일 수 있음)

---

## 포스트 조회 시스템

### 조회수 관리

```mermaid
flowchart TD
    A[포스트 조회 요청] --> B{clientIp 제공됨?}
    
    B -->|Yes| C[캐시에서 IP별 마지막 조회 시간 확인]
    B -->|No| H[조회수 무조건 증가]
    
    C --> D{10분 이내 조회?}
    D -->|Yes| E[조회수 증가하지 않음]
    D -->|No| F[조회수 증가]
    
    F --> G[IP별 조회 시간 캐시 업데이트]
    G --> I[1시간 이상 된 캐시 항목 정리]
    
    E --> J[포스트 정보 반환]
    H --> J
    I --> J
```

### 캐시 관리

- **캐시 키**: `view:${postId}:${clientIp}`
- **캐시 시간**: 10분 (중복 조회 방지)
- **정리 주기**: 1시간마다 오래된 항목 삭제

---

## 권한 관리

### 포스트 상태별 접근 권한

```mermaid
graph LR
    subgraph "포스트 상태"
        PUBLIC[PUBLIC]
        PRIVATE[PRIVATE]
        DRAFT[DRAFT]
    end
    
    subgraph "사용자 유형"
        OWNER_USER[포스트 편집자]
        TEAM_MEMBER[팀 멤버]
        OTHER_USER[일반 사용자]
        GUEST[비로그인 사용자]
    end
    
    PUBLIC --> OWNER_USER
    PUBLIC --> TEAM_MEMBER
    PUBLIC --> OTHER_USER
    PUBLIC --> GUEST
    
    PRIVATE --> OWNER_USER
    PRIVATE --> TEAM_MEMBER
    
    DRAFT --> OWNER_USER
```

### 권한 검증 플로우

```mermaid
sequenceDiagram
    participant U as User
    participant G as Guard
    participant PS as PostService
    participant DB as Database
    
    U->>G: 포스트 수정/삭제 요청
    G->>G: JWT 토큰 검증
    
    alt 토큰 유효
        G->>PS: 포스트 작업 수행
        PS->>DB: 포스트 조회
        PS->>PS: Editor 테이블에서 사용자 권한 확인
        
        alt OWNER 또는 EDITOR 역할
            PS->>DB: 작업 수행
            PS-->>G: 성공 응답
        else 권한 없음
            PS-->>G: 403 Forbidden
        end
    else 토큰 무효
        G-->>U: 401 Unauthorized
    end
    
    G-->>U: 최종 응답
```

---

## 🔄 시스템 간 연동

### 팀 관리 시스템과의 연동

1. **팀 멤버 조회**: `TeamMemberService.getJoinedTeamMembersByTeamId()`
2. **팀 정보 포함**: 포스트 응답에 팀 이름 포함
3. **권한 상속**: 팀 멤버십에 따른 포스트 접근 권한

### 사용자 시스템과의 연동

1. **공개 사용자 정보**: `toPublicUser()` 헬퍼 사용
2. **프로필 사진**: 포스트 작성자 정보에 포함
3. **닉네임 표시**: 다중 작성자 지원

---

## 🚀 성능 최적화

### 데이터베이스 최적화

1. **인덱스 전략**:
   - `editor(userId, postId)` 복합 인덱스
   - `post(status, teamId)` 복합 인덱스
   - `post_tag(postId, tagId)` 복합 인덱스

2. **쿼리 최적화**:
   - LEFT JOIN으로 관련 데이터 한 번에 조회
   - 서브쿼리를 통한 페이지네이션

### 메모리 최적화

1. **조회수 캐싱**: Map 기반 인메모리 캐시
2. **캐시 정리**: 정기적 오래된 항목 삭제
3. **메모리 사용량 모니터링**: 캐시 크기 제한 필요

---

## 🔮 향후 개선 계획

### 1. 실시간 협업 기능

- 여러 편집자가 동시에 편집할 때 충돌 방지
- 실시간 편집 상태 표시
- 변경 사항 실시간 동기화

### 2. 포스트 히스토리

- 편집 이력 추적
- 버전 관리 시스템
- 변경 사항 롤백 기능

### 3. 권한 세분화

- 편집자별 세부 권한 설정
- 읽기 전용 편집자 역할
- 승인 기반 편집 플로우

### 4. 태그 관리 고도화

- 태그 통계 및 분석
- 고아 태그 자동 정리
- 태그 자동 추천 시스템

---

_Last Updated: 2025-08-15_  
_Version: 1.0_  
_Key Features: Multi-Editor Support, Team Collaboration, Tag Management, View Count System_