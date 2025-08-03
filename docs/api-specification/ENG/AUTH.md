# Authentication

> ⚠️ All error responses follow a consistent structure:
> `{success: false, statusCode, message (string array), error, timestamp, path}`

## Google OAuth Login

### Start Google OAuth Login

> auth/auth.controller.ts
> **`GET /api/auth/google`**

-   Redirects user to Google for authentication.

### Google OAuth Callback

> auth/auth.controller.ts
> **`GET /api/auth/google/callback`**

-   Handles Google callback, issues JWT tokens, and redirects to frontend.
-   **Response**: Redirects to frontend URL with tokens stored in `HttpOnly` cookies. No JSON body is returned.

## Local Login

### Sign Up (Local Account)

> auth/auth.controller.ts
> **`POST /api/auth/signup`**

-   Registers a new user with local credentials.
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

-   **Exception Checklist**(✅ OR ❌):
    -   Email Conflict ✅
    -   Nickname Conflict ✅

### Login (Local Account)

> auth/auth.controller.ts
> **`POST /api/auth/login`**

-   Registers a new user with local credentials.
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

-   **Exception Checklist**(✅ OR ❌):

    -   Wrong email ✅
    -   Wrong password ✅
    -   No local user try to local login ✅

### Send Email Verification Code

> auth/auth.controller.ts
> **`POST /api/auth/send-email-code`**

-   **Request Body**: `{ email }`
-   Sends a verification code to the provided email address.
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

-   **Exception Checklist**(✅ OR ❌):

    -   Email not registered(Only when user exists ) ❌
    -   Email is oauth email(Only local email user) ❌

## Token Management

### Refresh Access Token

> auth/auth.controller.ts

-   `POST /api/auth/refresh`
-   Requires refresh token in HttpOnly cookie.
-   Issues a new access token if the refresh token is valid.

### Logout

> auth/auth.controller.ts

-   `POST /api/auth/logout`
-   Clears authentication cookies and logs out the user.
