# Post API 명세서

> 포스트 관련 API 엔드포인트를 정의합니다.

## 📋 목차

- [포스트 생성](#포스트-생성)
- [포스트 조회](#포스트-조회)
  - [개별 포스트 조회](#개별-포스트-조회)
  - [전체 포스트 목록 조회](#전체-포스트-목록-조회)
  - [팀별 포스트 조회](#팀별-포스트-조회)
- [포스트 수정](#포스트-수정)
- [포스트 삭제](#포스트-삭제)
- [드래프트 관리](#드래프트-관리)

---

## 포스트 생성

### POST `/api/posts`

**인증**: 필요 (JWT)

**설명**: 새로운 포스트를 생성합니다.

**Request Body:**
```json
{
  "title": "포스트 제목",
  "content": "포스트 내용",
  "excerpt": "포스트 요약",
  "thumbnailImage": "https://example.com/thumbnail.jpg",
  "status": "PUBLIC", // PUBLIC, PRIVATE, DRAFT
  "teamId": 1, // optional, 팀 포스트인 경우
  "tags": ["React", "TypeScript"]
}
```

**Response:**
```json
{
  "id": 1,
  "title": "포스트 제목",
  "content": "포스트 내용",
  "excerpt": "포스트 요약",
  "thumbnailImage": "https://example.com/thumbnail.jpg",
  "status": "PUBLIC",
  "viewCount": 0,
  "likeCount": 0,
  "commentCount": 0,
  "teamId": 1,
  "createdAt": "2025-08-15T00:00:00.000Z",
  "updatedAt": "2025-08-15T00:00:00.000Z",
  "team": {
    "id": 1,
    "name": "팀명"
  },
  "editors": [
    {
      "userId": 1,
      "role": "OWNER",
      "user": {
        "id": 1,
        "nickname": "작성자",
        "profilePicture": "https://example.com/profile.jpg"
      }
    }
  ],
  "postTags": [
    {
      "tag": {
        "name": "React"
      }
    }
  ]
}
```

---

## 드래프트 관리

### POST `/api/posts/draft`

**인증**: 필요 (JWT)

**설명**: 포스트를 드래프트로 저장합니다.

**Request Body:**
```json
{
  "title": "드래프트 제목",
  "content": "드래프트 내용",
  "excerpt": "드래프트 요약",
  "thumbnailImage": "https://example.com/thumbnail.jpg",
  "teamId": 1, // optional
  "tags": ["React", "TypeScript"]
}
```

**Response:** 포스트 생성과 동일하며 `status`가 `"DRAFT"`

---

## 포스트 조회

### 개별 포스트 조회

#### GET `/api/posts/:id`

**인증**: 불필요

**설명**: 특정 포스트를 조회합니다. 조회 시 조회수가 증가합니다.

**Path Parameters:**
- `id` (number): 포스트 ID

**Response:** 포스트 생성 응답과 동일

**조회수 증가 로직:**
- 동일 IP에서 10분 이내 재조회 시 조회수 증가하지 않음
- 캐시를 통한 중복 조회 방지

---

### 전체 포스트 목록 조회

#### GET `/api/posts`

**인증**: 불필요

**설명**: 공개된 포스트 목록을 최신순으로 조회합니다.

**Query Parameters:**
- `limit` (number, optional): 조회할 포스트 수 (기본값: 20)
- `offset` (number, optional): 시작 위치 (기본값: 0)

**Response:**
```json
[
  {
    "id": 1,
    "title": "포스트 제목",
    "excerpt": "포스트 요약",
    "thumbnailImage": "https://example.com/thumbnail.jpg",
    "viewCount": 100,
    "likeCount": 10,
    "commentCount": 5,
    "teamId": 1,
    "teamName": "팀명",
    "createdAt": "2025-08-15T00:00:00.000Z",
    "updatedAt": "2025-08-15T00:00:00.000Z",
    "tags": ["React", "TypeScript"],
    "authors": [
      {
        "id": 1,
        "nickname": "작성자",
        "profilePicture": "https://example.com/profile.jpg"
      }
    ]
  }
]
```

---

### 팀별 포스트 조회

#### GET `/api/posts/teams/:id/public`

**인증**: 불필요

**설명**: 특정 팀의 공개 포스트를 조회합니다.

**Path Parameters:**
- `id` (number): 팀 ID

**Response:** 포스트 목록 응답과 동일

---

#### GET `/api/posts/teams/:id/private`

**인증**: 필요 (SmartAuthGuard)

**설명**: 특정 팀의 비공개 포스트를 조회합니다.

**Path Parameters:**
- `id` (number): 팀 ID

**Response:** 포스트 목록 응답과 동일

**권한**: 팀 멤버만 조회 가능

---

#### GET `/api/posts/teams/:id/draft`

**인증**: 필요 (SmartAuthGuard)

**설명**: 특정 팀의 드래프트 포스트를 조회합니다.

**Path Parameters:**
- `id` (number): 팀 ID

**Response:** 포스트 목록 응답과 동일

**권한**: 팀 멤버만 조회 가능

---

## 포스트 수정

### PATCH `/api/posts/:id`

**인증**: 필요 (SmartAuthGuard)

**설명**: 기존 포스트를 수정합니다.

**Path Parameters:**
- `id` (number): 포스트 ID

**Request Body:**
```json
{
  "title": "수정된 제목", // optional
  "content": "수정된 내용", // optional
  "excerpt": "수정된 요약", // optional
  "thumbnailImage": "https://example.com/new-thumbnail.jpg", // optional
  "status": "PRIVATE", // optional
  "teamId": 2, // optional
  "tags": ["Vue", "JavaScript"] // optional
}
```

**Response:** 수정된 포스트 전체 정보

**권한**: 
- 포스트 편집자(`OWNER` 또는 `EDITOR` 역할)만 수정 가능

**트랜잭션 처리:**
- 태그 변경 시 기존 태그 삭제 후 새 태그 생성
- 팀 변경 시 편집자 목록 재구성

---

## 포스트 삭제

### DELETE `/api/posts/:id`

**인증**: 필요 (SmartAuthGuard)

**설명**: 포스트를 삭제합니다 (Soft Delete).

**Path Parameters:**
- `id` (number): 포스트 ID

**Response:**
```json
true
```

**권한**: 
- 포스트 편집자(`OWNER` 또는 `EDITOR` 역할)만 삭제 가능

**삭제 처리:**
- Soft Delete: `deletedAt` 필드에 삭제 시간 설정
- 관련 편집자 정보도 함께 삭제

---

## 🔄 Editor 시스템

포스트는 Editor 시스템을 통해 다중 편집자를 지원합니다.

### Editor 역할

- **OWNER**: 포스트 생성자, 모든 권한
- **EDITOR**: 편집 권한이 있는 사용자

### 팀 포스트의 Editor 자동 할당

1. **팀 포스트 생성 시**: 팀의 모든 멤버가 자동으로 Editor에 추가
2. **생성자**: `OWNER` 역할
3. **다른 팀원**: `EDITOR` 역할

### 개인 포스트의 Editor

- 생성자만 `OWNER` 역할로 할당

---

## 🏷️ 태그 시스템

### 태그 자동 생성

- 새로운 태그명이 포함된 경우 자동으로 Tag 테이블에 생성
- 기존 태그와 PostTag 관계 테이블로 연결

### 태그 수정

- 포스트 수정 시 기존 태그 관계를 모두 삭제하고 새로 생성
- 고아 태그는 별도 정리 프로세스 필요 (향후 구현)

---

## 🔒 권한 및 보안

### 인증 가드

- **JwtAuthGuard**: 일반 JWT 인증
- **SmartAuthGuard**: 선택적 인증 (로그인된 사용자만 추가 기능)

### 권한 체크

1. **포스트 수정/삭제**: Editor 테이블에서 사용자 권한 확인
2. **팀 포스트 조회**: 팀 멤버십 확인 (Private/Draft)
3. **공개 포스트**: 권한 체크 없음

---

## 📊 성능 최적화

### 조회수 캐싱

- IP별 조회 시간을 메모리에 캐싱
- 10분 이내 재조회 시 조회수 증가하지 않음
- 1시간마다 오래된 캐시 항목 정리

### 쿼리 최적화

- LEFT JOIN을 통한 관련 데이터 한 번에 조회
- 페이지네이션을 위한 서브쿼리 사용

---

## 🐛 에러 응답

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Post not found"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You do not have permission to edit this post"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Failed creating post"
}
```

---

_Last Updated: 2025-08-15_  
_API Version: v1_  
_Features: CRUD, Team Posts, Draft System, Multi-Editor Support_