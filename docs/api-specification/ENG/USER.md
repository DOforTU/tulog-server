# User Management API

> ⚠️ All error responses follow a consistent structure:
> `{success: false, statusCode, message (string array), error, timestamp, path}`

## User Lookup

### Get Current User Info

> user/user.controller.ts

-   `GET /api/users/me`
-   Requires JWT authentication.
-   Returns the currently logged-in user's information.
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

-   **Failure Response**

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

-   **Exception Checklist**(✅ OR ❌):

    -   Unauthorized error ✅

### Get User by ID

> user/user.controller.ts

-   `GET /api/users/:id`
-   Returns user information for the given user ID.
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

-   **Exception Checklist**(✅ OR ❌):

    -   Can't find user ✅
    -   Can't find no active user ✅

### Get User by Nickname

> user/user.controller.ts

-   `GET /api/users/nickname/:nickname`
-   Returns user information for the given nickname.
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
    "timestamp": "2025-08-03T05:42:23.955Z",
    "path": "/api/users/nickname/dotu.standard"
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

-   **Exception Checklist**(✅ OR ❌):

    -   Can't find user ✅
    -   Can't find no active user ✅

### Get User by ID or Nickname (Query)

> user/user.controller.ts

-   `GET /api/users?id={id}` or `GET /api/users?nickname={nickname}`
-   Returns user information by query parameter.
-   Responses are same as get by id, nickname

## User Update & Deletion

### Update Password

> auth/auth.controller.ts

-   `PATCH /api/auth/password`
-   Requires JWT authentication (access token).
-   Request Body: `{ oldPassword, newPassword }`
-   Updates the user's password.
-   **Only Local user available.**

### Update User Info

> user/user.controller.ts

-   `PATCH /api/users/me`
-   Requires JWT authentication.
-   Request Body: `{ name, nickname, ... }`
-   Updates the current user's information.

### Soft Delete User

> user/user.controller.ts

-   `PATCH /api/users/me/delete`
-   Requires JWT authentication.
-   Soft deletes the current user's account

### Permanently Delete User (Admin)

> user/user.controller.ts

-   `DELETE /api/users/:id/hard`
-   Requires admin privileges.
-   Permanently deletes the user with the given ID.

### Restore Deleted User (Admin)

> user/user.controller.ts

-   `PATCH /api/users/:id/restore`
-   Requires admin privileges.
-   Restores a previously deleted user.

## User Statistics

**Get Deleted Users List**

     `GET /api/users/deleted`
     Returns a list of soft-deleted users.

**Get Active User Count**
`GET /api/users/count`
Returns the number of active users.
