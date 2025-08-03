# Block User API

> ⚠️ 모든 에러 응답은 아래와 같음:  
> `{ success: false, statusCode, message (string array), error, timestamp, path }`

---

## Block / Unblock Actions

### Block a User

> block/user-block.controller.ts  
> **`POST /api/users/:id/block`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   지정된 사용자 ID를 차단한다.
-   차단 시 해당 사용자와의 상호작용(팔로우, 댓글 등)을 제한한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "id": 1,
        "blockerId": 4,
        "blockedId": 3,
        "createdAt": "2025-08-03T09:15:59.847Z"
    },
    "timestamp": "2025-08-03T09:15:59.867Z",
    "path": "/api/users/3/block"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 409,
    "message": ["You have already blocked this user."],
    "error": "CONFLICT",
    "timestamp": "2025-08-03T09:16:27.705Z",
    "path": "/api/users/3/block"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   토큰이 없거나 유효하지 않은 경우 → 401 ✅
    -   존재하지 않는 사용자 ID(삭제/비활성화 포함) → 404 ✅
    -   자기 자신을 차단 시도한 경우 → 400 ✅
    -   이미 차단한 사용자일 경우 → 409 ✅

---

### Get My Blocked Users

> block/user-block.controller.ts  
> **`GET /api/users/me/blocks`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   로그인한 사용자가 차단한 사용자 목록을 조회한다.
-   없다면 `data`에 빈 배열 `[]`을 반환한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 3,
            "nickname": "차단된유저",
            "profilePicture": "https://example.com/image.png",
            "isActive": true
        }
    ],
    "timestamp": "2025-08-03T09:20:22.123Z",
    "path": "/api/users/me/blocks"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 401,
    "message": ["Unauthorized"],
    "error": "UNAUTHORIZED",
    "timestamp": "2025-08-03T09:21:01.001Z",
    "path": "/api/users/me/blocks"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   토큰이 없거나 유효하지 않은 경우 → 401 ✅

---

### Unblock a User

> block/user-block.controller.ts  
> **`DELETE /api/users/:id/block`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   지정된 사용자 ID에 대한 차단을 해제한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": true,
    "timestamp": "2025-08-03T09:22:55.847Z",
    "path": "/api/users/3/block"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 404,
    "message": ["Block record not found"],
    "error": "NOT_FOUND",
    "timestamp": "2025-08-03T09:23:41.963Z",
    "path": "/api/users/3/block"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   토큰이 없거나 유효하지 않은 경우 → 401 ✅
    -   존재하지 않는 사용자 ID → 404 ✅
    -   차단하지 않은 사용자에 대해 해제 시도 → 404 ✅
