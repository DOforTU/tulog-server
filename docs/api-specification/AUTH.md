# Authentication

> ⚠️ 모든 에러 응답은 아래와 같음:  
> `{success: false, statusCode, message (string array), error, timestamp, path}`

## Google OAuth Login

### Start Google OAuth Login

> auth/auth.controller.ts  
> **`GET /api/auth/google`**

-   사용자를 Google 로그인 화면으로 리디렉션한다.

### Google OAuth Callback

> auth/auth.controller.ts  
> **`GET /api/auth/google/callback`**

-   Google 로그인 후 콜백을 처리하고, JWT 토큰을 발급한 뒤 프론트엔드로 리디렉션한다.
-   **Response**: 토큰은 `HttpOnly` 쿠키에 저장되며 프론트엔드 URL로 리디렉션된다. JSON 응답은 없다.

---

## Local Login

### Sign Up (Local Account)

> auth/auth.controller.ts  
> **`POST /api/auth/signup`**

-   로컬 계정 정보를 통해 새 사용자를 등록한다.

-   **Request Body**:

```json
{
    "email": "no.active.user.01@example.com",
    "password": "Example1@",
    "passwordConfirm": "Example1@",
    "name": "Alex",
    "nickname": "I_AM_NOT_ALEX"
}
```

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "email": "no.active.user.01@example.com"
    },
    "timestamp": "2025-08-03T05:03:52.442Z",
    "path": "/api/auth/signup"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 409,
    "message": ["Nickname already exists."],
    "error": "CONFLICT",
    "timestamp": "2025-08-03T05:08:51.080Z",
    "path": "/api/auth/signup"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   이미 가입된 이메일로 요청한 경우 → 409 Conflict ✅
    -   이미 사용 중인 닉네임으로 요청한 경우 → 409 Conflict ✅

---

### Login (Local Account)

> auth/auth.controller.ts  
> **`POST /api/auth/login`**

-   로컬 계정으로 로그인한다.

-   **Request Body**:

```json
{
    "email": "no.active.user.01@example.com",
    "password": "Example1@"
}
```

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "createdAt": "2025-08-03T05:13:37.024Z",
        "updatedAt": "2025-08-03T05:13:37.024Z",
        "deletedAt": null,
        "id": 3,
        "email": "no.active.user.02@example.com",
        "name": "Alex",
        "nickname": "I_AM_ALEX",
        "role": "user",
        "profilePicture": "https://github.com/DOforTU/tulog/blob/main/img/user-profile/default-avatar.png?raw=true",
        "isActive": false
    },
    "timestamp": "2025-08-03T05:15:39.534Z",
    "path": "/api/auth/login"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 400,
    "message": ["Invalid password."],
    "error": "BAD_REQUEST",
    "timestamp": "2025-08-03T05:18:03.917Z",
    "path": "/api/auth/login"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   존재하지 않는 이메일로 로그인 시도 → 400 Bad Request ✅
    -   잘못된 비밀번호로 로그인 시도 → 400 Bad Request ✅
    -   OAuth 사용자 이메일로 로컬 로그인 시도 → 400 Bad Request ✅

---

### Send Email Verification Code

> auth/auth.controller.ts  
> **`POST /api/auth/send-email-code`**

-   **Request Body**: `{ email }`
-   해당 이메일 주소로 인증 코드를 전송한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "success": true,
        "message": "인증코드가 전송되었습니다."
    },
    "timestamp": "2025-08-03T05:31:41.627Z",
    "path": "/api/auth/send-email-code"
}
```

-   **Failure Response**:

```json

```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   존재하지 않는 이메일로 요청한 경우 (가입된 사용자만 가능) → 404 Not Found ❌
    -   OAuth 계정의 이메일로 요청한 경우 (로컬 사용자만 가능) → 409 Conflict ❌

---

## Token Management

### Refresh Access Token

> auth/auth.controller.ts  
> **`POST /api/auth/refresh`**

-   `HttpOnly` 쿠키에 있는 refresh token이 필요하다.
-   유효한 경우 새로운 access token을 발급한다.

---

### Logout

> auth/auth.controller.ts  
> **`POST /api/auth/logout`**

-   인증 관련 쿠키를 제거하고 로그아웃 처리한다.
