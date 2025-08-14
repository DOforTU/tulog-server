# Editor API 명세서

> 사용자별 포스트 편집 권한 및 조회 API를 정의합니다.

## 📋 목차

- [사용자별 포스트 조회](#사용자별-포스트-조회)
  - [공개 포스트 조회](#공개-포스트-조회)
  - [팀 공개 포스트 조회](#팀-공개-포스트-조회)
  - [비공개 포스트 조회](#비공개-포스트-조회)
  - [팀 비공개 포스트 조회](#팀-비공개-포스트-조회)
  - [드래프트 포스트 조회](#드래프트-포스트-조회)

---

## 사용자별 포스트 조회

Editor 시스템을 기반으로 특정 사용자가 편집 권한을 가진 포스트들을 조회합니다.

### 공개 포스트 조회

#### GET `/api/editor/:userId/posts/public`

**인증**: 불필요

**설명**: 특정 사용자의 개인 공개 포스트를 조회합니다.

**Path Parameters:**
- `userId` (number): 사용자 ID

**조회 조건:**
- `status = 'PUBLIC'`
- `teamId = NULL` (개인 포스트)
- `deletedAt IS NULL`

**Response:**
```json
[
  {
    "id": 1,
    "title": "개인 공개 포스트",
    "excerpt": "포스트 요약",
    "thumbnailImage": "https://example.com/thumbnail.jpg",
    "viewCount": 100,
    "likeCount": 10,
    "commentCount": 5,
    "teamId": null,
    "teamName": null,
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

### 팀 공개 포스트 조회

#### GET `/api/editor/:userId/posts/team-public`

**인증**: 불필요

**설명**: 특정 사용자가 편집 권한을 가진 팀 공개 포스트를 조회합니다.

**Path Parameters:**
- `userId` (number): 사용자 ID

**조회 조건:**
- `status = 'PUBLIC'`
- `teamId IS NOT NULL` (팀 포스트)
- `deletedAt IS NULL`

**Response:** 공개 포스트 조회와 동일하며, `teamId`와 `teamName` 포함

---

### 비공개 포스트 조회

#### GET `/api/editor/:userId/posts/private`

**인증**: 필요 (JwtAuthGuard)

**설명**: 특정 사용자의 개인 비공개 포스트를 조회합니다.

**Path Parameters:**
- `userId` (number): 사용자 ID

**조회 조건:**
- `status = 'PRIVATE'`
- `teamId = NULL` (개인 포스트)
- `deletedAt IS NULL`

**권한**: 본인의 포스트만 조회 가능

**Response:** 공개 포스트 조회와 동일

---

### 팀 비공개 포스트 조회

#### GET `/api/editor/:userId/posts/team-private`

**인증**: 필요 (JwtAuthGuard)

**설명**: 특정 사용자가 편집 권한을 가진 팀 비공개 포스트를 조회합니다.

**Path Parameters:**
- `userId` (number): 사용자 ID

**조회 조건:**
- `status = 'PRIVATE'`
- `teamId IS NOT NULL` (팀 포스트)
- `deletedAt IS NULL`

**권한**: 
- 본인의 포스트 또는
- 해당 팀의 멤버만 조회 가능

**Response:** 공개 포스트 조회와 동일하며, `teamId`와 `teamName` 포함

---

### 드래프트 포스트 조회

#### GET `/api/editor/:userId/posts/draft`

**인증**: 필요 (JwtAuthGuard)

**설명**: 특정 사용자의 드래프트 포스트를 조회합니다 (개인/팀 구분 없음).

**Path Parameters:**
- `userId` (number): 사용자 ID

**조회 조건:**
- `status = 'DRAFT'`
- `deletedAt IS NULL`

**권한**: 본인의 드래프트만 조회 가능

**Response:** 공개 포스트 조회와 동일

---

## 🔄 Editor 시스템 동작 원리

### Editor 테이블 구조

```sql
CREATE TABLE editor (
  postId INT,
  userId INT,
  role ENUM('OWNER', 'EDITOR'),
  createdAt TIMESTAMP,
  PRIMARY KEY (postId, userId)
);
```

### 역할별 권한

- **OWNER**: 포스트 생성자, 모든 편집 권한
- **EDITOR**: 편집 권한이 있는 협력자

### 팀 포스트의 Editor 할당

1. **팀 포스트 생성 시**: 팀의 `JOINED` 상태 멤버 모두가 Editor에 추가
2. **생성자**: `OWNER` 역할
3. **다른 팀원**: `EDITOR` 역할
4. **팀 멤버 변경 시**: Editor 목록도 자동 업데이트

---

## 🗂️ 데이터 변환

### PostCardDto 변환

모든 응답은 `PostCardDto` 형태로 변환되어 반환됩니다:

```typescript
interface PostCardDto {
  id: number;
  title: string;
  excerpt: string;
  thumbnailImage: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  teamId: number | null;
  teamName: string | null;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  authors: PublicUser[];
}
```

### Authors 필드

- **OWNER 역할 사용자들**이 먼저 나열
- **EDITOR 역할 사용자들**이 그 다음에 나열
- 각 사용자는 `toPublicUser()` 헬퍼를 통해 공개 정보만 포함

---

## 🔍 쿼리 최적화

### JOIN 전략

모든 Editor API는 다음과 같은 JOIN을 사용합니다:

```sql
SELECT * FROM post
LEFT JOIN team ON team.id = post.teamId
LEFT JOIN editor ON editor.postId = post.id
LEFT JOIN user ON user.id = editor.userId
LEFT JOIN post_tag ON post_tag.postId = post.id
LEFT JOIN tag ON tag.id = post_tag.tagId
WHERE editor.userId = ? 
  AND post.status = ?
  AND post.deletedAt IS NULL
ORDER BY post.createdAt DESC
```

### 성능 고려사항

1. **인덱스**: `editor(userId, postId)` 복합 인덱스 필요
2. **필터링**: 데이터베이스 레벨에서 조건 필터링
3. **정렬**: 생성일 기준 내림차순 정렬

---

## 🔒 보안 및 권한

### 권한 검증

1. **공개 포스트**: 별도 권한 검증 없음
2. **비공개/드래프트**: JWT 토큰을 통한 사용자 인증 필요
3. **팀 포스트**: 추가로 팀 멤버십 확인

### 데이터 보안

- 모든 사용자 정보는 `toPublicUser()` 헬퍼를 통해 공개 정보만 노출
- 삭제된 포스트는 자동으로 결과에서 제외
- 비활성 사용자의 포스트는 별도 필터링 로직 적용

---

## 🐛 에러 응답

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Failed to fetch posts"
}
```

---

## 📊 사용 예시

### 사용자 프로필 페이지

```typescript
// 공개 포스트만 표시 (비로그인 사용자)
const publicPosts = await fetch('/api/editor/123/posts/public');

// 로그인된 본인인 경우 모든 포스트 표시
const privatePosts = await fetch('/api/editor/123/posts/private');
const draftPosts = await fetch('/api/editor/123/posts/draft');
```

### 팀 페이지

```typescript
// 팀의 공개 포스트 (누구나 조회 가능)
const teamPublicPosts = await fetch('/api/editor/123/posts/team-public');

// 팀 멤버만 조회 가능한 비공개 포스트
const teamPrivatePosts = await fetch('/api/editor/123/posts/team-private');
```

---

_Last Updated: 2025-08-15_  
_API Version: v1_  
_Features: User-specific Post Queries, Multi-Editor Support, Team Integration_