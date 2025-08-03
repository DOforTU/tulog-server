# Follow User API

> ⚠️ 모든 에러 응답은 아래와 같음:  
> `{success: false, statusCode, message (string array), error, timestamp, path}`

---

## My Follow Info

### Get My Followers

> follow/follow.controller.ts  
> **`GET /api/users/me/followers`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   나를 팔로우하고 있는 사용자 목록을 조회한다.
-   없다면 `data`에 빈배열 `[]`을 반환한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 4,
            "nickname": "테스트_구글_유저_01",
            "profilePicture": "https://github.com/DOforTU/tulog/blob/main/img/user-profile/default-avatar.png?raw=true",
            "isActive": true
        }
    ],
    "timestamp": "2025-08-03T07:22:54.393Z",
    "path": "/api/users/me/followings"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 403,
    "message": ["이메일 인증이 필요합니다. 마이페이지에서 이메일 인증을 완료해주세요."],
    "error": "FORBIDDEN",
    "timestamp": "2025-08-03T07:13:52.840Z",
    "path": "/api/users/2/follow"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   토큰이 없거나 유효하지 않은 경우 → 401 ✅
    -   비활성화 유저인 경우 → 401 ✅

---

### Get My Followings

> follow/follow.controller.ts  
> **`GET /api/users/me/followings`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   내가 팔로우 중인 사용자 목록을 조회한다.
-   없다면 `data`에 빈배열 `[]`을 반환한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": [], // 빈배열도 가능
    "timestamp": "2025-08-03T07:22:54.393Z",
    "path": "/api/users/me/followings"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 401,
    "message": ["Unauthorized"],
    "error": "UNAUTHORIZED",
    "timestamp": "2025-08-03T07:24:32.081Z",
    "path": "/api/users/me/followings"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   토큰이 없거나 유효하지 않은 경우 → 401 ✅
    -   비활성화 유저인 경우 → 401 ✅

---

## Follow / Unfollow Actions

### Follow a User

> follow/follow.controller.ts  
> **`POST /api/users/:id/follow`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   지정된 사용자 ID를 팔로우한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "followerId": 6,
        "followingId": 4,
        "createdAt": "2025-08-03T07:15:59.847Z"
    },
    "timestamp": "2025-08-03T07:15:59.867Z",
    "path": "/api/users/4/follow"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 409,
    "message": ["You are already following this user"],
    "error": "CONFLICT",
    "timestamp": "2025-08-03T07:16:27.705Z",
    "path": "/api/users/4/follow"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   토큰이 없거나 유효하지 않은 경우 → 401 ✅
    -   존재하지 않는 사용자 ID(비활성화, 삭제된 사용자) → 404 ✅
    -   자기 자신을 팔로우 시도한 경우 → 400 ✅
    -   이미 팔로우 중인 경우 → 409 ✅

---

### Unfollow a User

> follow/follow.controller.ts  
> **`DELETE /api/users/:id/unfollow`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   지정된 사용자 ID를 언팔로우한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": true,
    "timestamp": "2025-08-03T07:25:39.958Z",
    "path": "/api/users/4/unfollow"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 409,
    "message": ["You are not following this user"],
    "error": "CONFLICT",
    "timestamp": "2025-08-03T07:25:59.869Z",
    "path": "/api/users/4/unfollow"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   토큰이 없거나 유효하지 않은 경우 → 401 ✅
    -   존재하지 않는 사용자 ID → 404 ✅
    -   팔로우하지 않은 상태에서 언팔로우 시도 → 400 ✅

---

## User Follow Info

### Get Followers of a User

> follow/follow.controller.ts  
> **`GET /api/users/:id/followers`**

-   지정된 사용자 ID를 팔로우 중인 사용자 목록을 조회한다.
-   없다면 `data`에 빈배열 `[]`을 반환한다.
-   **Response**: `me/followers`와 같음

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   존재하지 않는 사용자 ID → 404 ✅

---

### Get Followings of a User

> follow/follow.controller.ts  
> **`GET /api/users/:id/followings`**

-   지정된 사용자가 팔로우 중인 사용자 목록을 조회한다.
-   없다면 `data`에 빈배열 `[]`을 반환한다.
-   **Response**: `me/followings`와 같음

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   존재하지 않는 사용자 ID → 404 ✅
