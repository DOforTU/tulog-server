# User Management API

> ⚠️ 모든 에러 응답은 아래와 같음:  
> `{success: false, statusCode, message (string array), error, timestamp, path}`

---

## User Lookup

### Get Current User Info

> user/user.controller.ts  
> **`GET /api/users/me`**

-   JWT 인증이 필요하다.
-   로그인한 사용자의 정보를 반환한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "createdAt": "2025-08-03T05:29:47.446Z",
        "updatedAt": "2025-08-03T05:29:47.446Z",
        "deletedAt": null,
        "id": 4,
        "email": "dotu.standard@gmail.com",
        "name": "DOTU",
        "nickname": "dotu.standard",
        "role": "user",
        "profilePicture": "https://lh3.googleusercontent.com/a/ACg8ocJIO23-xTU26chV7V7VPy6KOn6UVfQmVame1W5MZoqcVUYfza4=s96-c",
        "isActive": true
    },
    "timestamp": "2025-08-03T05:36:06.037Z",
    "path": "/api/users/me"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 401,
    "message": ["Unauthorized"],
    "error": "UNAUTHORIZED",
    "timestamp": "2025-08-03T03:00:35.099Z",
    "path": "/api/users/me"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   토큰이 없거나 유효하지 않은 경우 → 401 Unauthorized ✅

---

### Get User by ID

> user/user.controller.ts  
> **`GET /api/users/:id`**

-   주어진 사용자 ID에 해당하는 정보를 반환한다.
-   누구나 조회 가능하기 때문에 민감한 정보는 제외된다: `ResponsePublicUser`

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "id": 4,
        "nickname": "dotu.standard",
        "profilePicture": "https://lh3.googleusercontent.com/a/ACg8ocJIO23-xTU26chV7V7VPy6KOn6UVfQmVame1W5MZoqcVUYfza4=s96-c",
        "isActive": true
    },
    "timestamp": "2025-08-03T05:36:42.105Z",
    "path": "/api/users/4"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 404,
    "message": ["User with ID 5000 not found"],
    "error": "NOT_FOUND",
    "timestamp": "2025-08-03T05:37:06.718Z",
    "path": "/api/users/5000"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   존재하지 않는 ID로 조회한 경우 → 404 Not Found ✅
    -   비활성화 또는 삭제된 사용자인 경우 → 404 Not Found ✅

---

### Get User by Nickname

> user/user.controller.ts  
> **`GET /api/users/nickname/:nickname`**

-   주어진 닉네임에 해당하는 사용자 정보를 반환한다.
-   누구나 조회 가능하기 때문에 민감한 정보는 제외된다: `ResponsePublicUser`

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "id": 4,
        "nickname": "dotu.standard",
        "profilePicture": "https://lh3.googleusercontent.com/a/ACg8ocJIO23-xTU26chV7V7VPy6KOn6UVfQmVame1W5MZoqcVUYfza4=s96-c",
        "isActive": true
    },
    "timestamp": "2025-08-03T05:36:42.105Z",
    "path": "/api/users/4"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 404,
    "message": ["User with nickname I_AM_ALEX not found"],
    "error": "NOT_FOUND",
    "timestamp": "2025-08-03T05:42:48.430Z",
    "path": "/api/users/nickname/I_AM_ALEX"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   존재하지 않는 닉네임으로 조회한 경우 → 404 Not Found ✅
    -   비활성화 또는 삭제된 사용자인 경우 → 404 Not Found ✅

---

### Get User by ID or Nickname (Query)

> user/user.controller.ts  
> **`GET /api/users/search/id-or-nickname?id={id}`** 또는 **`GET /api/users/search/id-or-nickname?nickname={nickname}`**

-   ID 또는 닉네임을 query parameter로 받아 사용자 정보를 조회한다.
-   응답은 위 ID 또는 닉네임 조회와 동일하다.

---

### Get User Details by ID

> user/user.controller.ts  
> **`GET /api/users/:id/details`**

-   주어진 사용자 ID에 해당하는 상세 정보를 반환한다. (팀, 팔로워, 팔로잉 정보 포함)

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "user": {
            "id": 4,
            "nickname": "dotu.standard",
            "profilePicture": "https://example.com/image.jpg",
            "isActive": true
        },
        "teams": [
            {
                "id": 1,
                "name": "Team A",
                "description": "Team description",
                "image": "https://example.com/team-image.jpg"
            }
        ],
        "followers": [
            {
                "id": 2,
                "nickname": "follower1",
                "profilePicture": "https://example.com/avatar.jpg",
                "isActive": true
            }
        ],
        "following": [
            {
                "id": 3,
                "nickname": "following1",
                "profilePicture": "https://example.com/avatar.jpg",
                "isActive": true
            }
        ]
    },
    "timestamp": "2025-08-03T05:36:42.105Z",
    "path": "/api/users/4/details"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 404,
    "message": ["User with ID 5000 not found"],
    "error": "NOT_FOUND",
    "timestamp": "2025-08-03T05:37:06.718Z",
    "path": "/api/users/5000/details"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   존재하지 않는 ID로 조회한 경우 → 404 Not Found ✅
    -   비활성화 또는 삭제된 사용자인 경우 → 404 Not Found ✅

---

## User Update & Deletion

### Update Password

> auth/auth.controller.ts  
> **`PATCH /api/auth/password`**

-   JWT 인증이 필요하다. 비활성화 유저도 가능하다.
-   본인 확인 후 기존 비밀번호와 새 비밀번호를 입력받아 갱신한다.
-   로컬 사용자만 가능하다.
-   **Request Body**:

```json
{
    "oldPassword": "Example1@",
    "newPassword": "Alex1234!!"
}
```

-   **Success Response**

```json
{
    "success": true,
    "data": {
        "createdAt": "2025-08-03T05:03:52.424Z",
        "updatedAt": "2025-08-03T06:07:40.006Z",
        "deletedAt": null,
        "id": 1,
        "email": "no.active.user.01@example.com",
        "name": "Alex",
        "nickname": "I_AM_NOT_ALEX",
        "role": "user",
        "profilePicture": "https://github.com/DOforTU/tulog/blob/main/img/user-profile/default-avatar.png?raw=true",
        "isActive": false
    },
    "timestamp": "2025-08-03T06:10:21.736Z",
    "path": "/api/auth/password"
}
```

-   **Failure Response**

```json
{
    "success": false,
    "statusCode": 400,
    "message": ["Password update is only allowed for local accounts."],
    "error": "BAD_REQUEST",
    "timestamp": "2025-08-03T06:05:01.034Z",
    "path": "/api/auth/password"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   OAuth 계정이 패스워드 변경 요청을 한 경우 → 400 ✅
    -   기존 패스워드가 일치하지 않는 경우 → 400 ✅
    -   패스워드 조건에 맞지 않는 경우 → 400 ✅

---

### Update User Info

> user/user.controller.ts  
> **`PATCH /api/users/me`**

-
-   JWT 인증이 필요하다. 비활성화 유저는 요청할 수 없다.
-   이름, 닉네임, 프로필 이미지 등을 수정한다.
-   **Request Body**: (3가지 요소 중 1개만 요청해도 가능)

```json
{
    "name": "구글유저01",
    "nickname": "테스트_구글_유저_01",
    "profilePicture": "https://github.com/DOforTU/tulog/blob/main/img/user-profile/default-avatar.png?raw=true"
}
```

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "createdAt": "2025-08-03T05:29:47.446Z",
        "updatedAt": "2025-08-03T06:19:46.432Z",
        "deletedAt": null,
        "id": 4,
        "email": "dotu.standard@gmail.com",
        "name": "구글유저01",
        "nickname": "테스트_구글_유저_01",
        "role": "user",
        "profilePicture": "https://github.com/DOforTU/tulog/blob/main/img/user-profile/default-avatar.png?raw=true",
        "isActive": true
    },
    "timestamp": "2025-08-03T06:19:46.446Z",
    "path": "/api/users/me"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 403,
    "message": ["이메일 인증이 필요합니다. 마이페이지에서 이메일 인증을 완료해주세요."],
    "error": "FORBIDDEN",
    "timestamp": "2025-08-03T06:12:05.926Z",
    "path": "/api/users/me"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   닉네임 중복 → 409 ✅
    -   닉네임, 이름 요구 조건 부합 → 400 ✅

---

### Soft Delete User

> user/user.controller.ts  
> **`PATCH /api/users/me/delete`**

-   JWT 인증이 필요하다.
-   자신의 계정을 소프트 삭제한다.
-   **Success Response**:

```json
{
    "success": true,
    "data": true,
    "timestamp": "2025-08-03T06:36:28.339Z",
    "path": "/api/users/me/delete"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 401,
    "message": ["Unauthorized"],
    "error": "UNAUTHORIZED",
    "timestamp": "2025-08-03T06:35:31.771Z",
    "path": "/api/users/me/delete"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   JWT 인증 → ✅

---

### Get All Users (Admin)

> user/user.admin.controller.ts  
> **`GET /api/admin/users/all`**

-   관리자 권한이 필요하다.
-   모든 활성 사용자 목록을 조회한다.

---

### Get Deleted Users List (Admin)

> user/user.admin.controller.ts  
> **`GET /api/admin/users/deleted`**

-   관리자 권한이 필요하다.
-   삭제된 사용자 목록을 조회한다.

---

### Get Active User Count (Admin)

> user/user.admin.controller.ts  
> **`GET /api/admin/users/stats/count`**

-   관리자 권한이 필요하다.
-   현재 활성화된 사용자 수를 반환한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "count": 42
    },
    "timestamp": "2025-08-03T06:36:28.339Z",
    "path": "/api/admin/users/stats/count"
}
```

---

### Permanently Delete User (Admin)

> user/user.admin.controller.ts  
> **`DELETE /api/admin/users/:id/hard`**

-   관리자 권한이 필요하다.
-   지정된 ID의 사용자를 영구 삭제한다.

---

### Restore Deleted User (Admin)

> user/user.admin.controller.ts  
> **`PATCH /api/admin/users/:id/restore`**

-   관리자 권한이 필요하다.
-   소프트 삭제된 사용자를 복구한다.
