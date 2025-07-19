# TULOG API Documentation

> Detailed endpoint specification for TULOG API server.

## Table of Contents

-   [Basic Information](#basic-information)
-   [Authentication](#authentication)
-   [User Management](#user-management)
-   [System](#system)
-   [Error Codes](#error-codes)
-   [Data Models](#data-models)

## Basic Information

### Base URL

```
http://localhost:8000
```

### Response Format

All API responses are in JSON format.

### Authentication Methods

-   **Google OAuth 2.0**: Social login only
-   **JWT + Refresh Token**: HttpOnly cookie-based authentication
-   **Automatic Token Refresh**: Auto-refresh every 14 minutes

### Headers

```http
Content-Type: application/json
Cookie: accessToken=<jwt_token>; refreshToken=<refresh_token>; userInfo=<user_info>
```

> **Security**: All tokens are transmitted via HttpOnly cookies to defend against XSS attacks.

---

## Authentication

### Start Google OAuth Login

Initiates the Google OAuth authentication flow.

```http
GET /auth/google
```

**Response**: Redirects to Google login page

---

### Google OAuth Callback

Handles the callback after Google authentication is completed.

```http
GET /auth/google/callback
```

**Query Parameters**:

-   `code`: Authentication code provided by Google

**Response**:

1. **Cookie Settings**:

    - `accessToken`: JWT access token (HttpOnly, expires in 15 minutes)
    - `refreshToken`: JWT refresh token (HttpOnly, expires in 30 days)
    - `userInfo`: User information (expires in 30 days)

2. **Redirect**:

```
http://localhost:3000/login?success=true
```

**Cookie Example**:

```http
Set-Cookie: accessToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; SameSite=Strict; Max-Age=900
Set-Cookie: refreshToken=eyJhbGciOiJIUzI1NiIs...; HttpOnly; SameSite=Strict; Max-Age=2592000
Set-Cookie: userInfo={"id":1,"email":"user@example.com",...}; SameSite=Strict; Max-Age=2592000
```

---

### Token Refresh

Issues a new access token using the refresh token.

```http
POST /auth/refresh
```

**Request Headers**:

```http
Cookie: refreshToken=<refresh_token>
```

**Response (Success)**:

```json
{
    "success": true,
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
        "id": 1,
        "email": "user@example.com",
        "username": "John Doe",
        "nickname": "user",
        "profilePicture": "https://lh3.googleusercontent.com/...",
        "provider": "google"
    }
}
```

**Response (Failure)**:

```json
{
    "success": false,
    "message": "No refresh token provided."
}
```

**Error Codes**:

-   `401`: Refresh token is missing or invalid

> **Auto Refresh**: Automatically called every 14 minutes by the frontend.

---

### Logout

Terminates the user session and deletes all authentication cookies.

```http
POST /auth/logout
```

**Response**:

```json
{
    "success": true,
    "message": "Logged out successfully"
}
```

**Cookie Deletion**:

-   `accessToken`: Deleted
-   `refreshToken`: Deleted
-   `userInfo`: Deleted

**Response Headers**:

```http
Set-Cookie: accessToken=; Max-Age=0
Set-Cookie: refreshToken=; Max-Age=0
Set-Cookie: userInfo=; Max-Age=0
```

---

## User Management

> **Note**: Accounts are created only through Google OAuth without separate user registration.

### Get Current Logged-in User Information

Retrieves information about the currently logged-in user.

```http
GET /users/me
```

**Request Headers**:

```http
Cookie: accessToken=<access_token>
```

**Response**:

```json
{
    "id": 1,
    "email": "user@example.com",
    "username": "John Doe",
    "nickname": "user",
    "googleId": "108729663647433890790",
    "profilePicture": "https://lh3.googleusercontent.com/a/ACg8ocI...",
    "provider": "google",
    "isActive": true,
    "isDeleted": false,
    "createdAt": "2025-07-14T14:30:00.000Z",
    "updatedAt": "2025-07-14T14:30:00.000Z",
    "deletedAt": null
}
```

**Errors**:

-   `401`: Not authenticated (JWT token required)

---

### Get All Users

Retrieves all active users.

```http
GET /users
```

**Response**:

```json
[
    {
        "id": 1,
        "email": "user@example.com",
        "username": "John Doe",
        "nickname": "user",
        "googleId": "108729663647433890790",
        "profilePicture": "https://lh3.googleusercontent.com/a/ACg8ocI...",
        "provider": "google",
        "isActive": true,
        "isDeleted": false,
        "createdAt": "2025-07-14T14:30:00.000Z",
        "updatedAt": "2025-07-14T14:30:00.000Z",
        "deletedAt": null
    }
]
```

---

### Get User Details

Retrieves detailed information about a specific user.

```http
GET /users/{id}
```

**Path Parameters**:

-   `id` (number): User ID

**Response**:

```json
{
    "id": 1,
    "email": "user@example.com",
    "username": "John Doe",
    "nickname": "user",
    "googleId": "108729663647433890790",
    "profilePicture": "https://lh3.googleusercontent.com/a/ACg8ocI...",
    "provider": "google",
    "isActive": true,
    "isDeleted": false,
    "createdAt": "2025-07-14T14:30:00.000Z",
    "updatedAt": "2025-07-14T14:30:00.000Z",
    "deletedAt": null
}
```

**Errors**:

-   `404`: User not found

---

### Update User Information

Updates existing user information.

```http
PUT /users/{id}
```

**Path Parameters**:

-   `id` (number): User ID

**Request Body**:

```json
{
    "username": "Updated Name",
    "nickname": "updated_nickname",
    "isActive": false
}
```

**Response**:

```json
{
    "id": 1,
    "email": "user@example.com",
    "username": "Updated Name",
    "nickname": "updated_nickname",
    "isActive": false,
    "updatedAt": "2025-07-14T15:00:00.000Z"
}
```

**Errors**:

-   `404`: User not found
-   `409`: Username or nickname conflict

---

### Soft Delete User

Soft deletes a user (recoverable).

```http
DELETE /users/{id}
```

**Path Parameters**:

-   `id` (number): User ID

**Request Headers**:

```http
Cookie: accessToken=<access_token>
```

**Response**:

```json
{
    "message": "User deleted successfully"
}
```

**Errors**:

-   `401`: Not authenticated (JWT token required)
-   `404`: User not found

---

### Hard Delete User

Permanently deletes a user (non-recoverable).

```http
DELETE /users/{id}/hard
```

**Path Parameters**:

-   `id` (number): User ID

**Request Headers**:

```http
Cookie: accessToken=<access_token>
```

**Response**:

```json
{
    "message": "User permanently deleted"
}
```

**Errors**:

-   `401`: Not authenticated (JWT token required)
-   `404`: User not found

---

### Restore User

Restores a soft-deleted user.

```http
PATCH /users/{id}/restore
```

**Path Parameters**:

-   `id` (number): User ID

**Response**:

```json
{
    "id": 1,
    "email": "restored@example.com",
    "username": "Restored User",
    "nickname": "restored",
    "isDeleted": false,
    "deletedAt": null,
    "updatedAt": "2025-07-14T16:00:00.000Z"
}
```

**Errors**:

-   `404`: Deleted user not found

---

### Get Deleted Users

Retrieves the list of soft-deleted users.

```http
GET /users/deleted
```

**Response**:

```json
[
    {
        "id": 3,
        "email": "deleted@example.com",
        "username": "Deleted User",
        "nickname": "deleted",
        "isDeleted": true,
        "deletedAt": "2025-07-14T15:30:00.000Z"
    }
]
```

---

### Get User Count

Retrieves the total number of active users.

```http
GET /users/count
```

**Response**:

```json
{
    "count": 25
}
```

---

## System

### Health Check

Checks basic system status.

```http
GET /api
```

**Response**:

```text
Hello World!
```

---

### Detailed Health Check

Checks detailed system status information.

```http
GET /api/health
```

**Response**:

```json
{
    "status": "OK",
    "timestamp": "2024-01-01T04:00:00.000Z"
}
```

---

### Test Page

Displays Google login test page.

```http
GET /
```

**Response**: HTML page (Google login test UI)

---

## Error Codes

### HTTP Status Codes

| Code  | Description    | Example                              |
| ----- | -------------- | ------------------------------------ |
| `200` | Success        | Request processed successfully       |
| `201` | Created        | New resource created                 |
| `400` | Bad Request    | Invalid data                         |
| `401` | Unauthorized   | JWT token missing or invalid         |
| `403` | Forbidden      | Access denied                        |
| `404` | Not Found      | Requested resource does not exist    |
| `409` | Conflict       | Duplicate data (email, username)     |
| `500` | Server Error   | Internal server error                |

### Error Response Format

```json
{
    "statusCode": 404,
    "message": "User with ID 999 not found",
    "error": "Not Found"
}
```

---

## Data Models

### User Entity

```typescript
interface User {
    id: number; // Primary key (auto increment)
    email: string; // Email (unique, from Google)
    username: string; // Username (Google real name)
    nickname: string; // Nickname (email prefix)
    googleId: string; // Google OAuth ID (unique)
    profilePicture?: string; // Google profile image URL
    provider: string; // Authentication provider ('google')
    isActive: boolean; // Active status (default: true)
    isDeleted: boolean; // Deletion status (default: false)
    createdAt: Date; // Creation timestamp
    updatedAt: Date; // Update timestamp
    deletedAt?: Date; // Deletion timestamp (for soft delete)
}
```

### UpdateUserDto

```typescript
interface UpdateUserDto {
    email?: string; // Optional (not changeable)
    username?: string; // Optional
    nickname?: string; // Optional
    profilePicture?: string; // Optional
    isActive?: boolean; // Optional
}
```

### JWT Token Payload

#### Access Token (15 minutes expiry)

```typescript
interface AccessTokenPayload {
    sub: number; // User ID
    email: string; // User email
    type: "access"; // Token type
    iat: number; // Issued at
    exp: number; // Expiry time
}
```

#### Refresh Token (30 days expiry)

```typescript
interface RefreshTokenPayload {
    sub: number; // User ID
    type: "refresh"; // Token type
    iat: number; // Issued at
    exp: number; // Expiry time
}
```

---

## Additional Information

### Testing in Development Environment

1. **Google Login Test**:

    - Visit `http://localhost:8000`
    - Click "Login with Google" button
    - Authenticate with Google account
    - Verify JWT tokens

2. **API Testing Tools**:

    - Use Postman, Thunder Client, or curl
    - Include JWT token in Authorization header

3. **Database Verification**:
    - Check `tulog.server_api.user` table with PostgreSQL client

### Important Notes

-   **Social Login Only**: Accounts created only through Google OAuth without separate registration
-   **HttpOnly Cookies**: All tokens transmitted via HttpOnly cookies to defend against XSS attacks
-   **Automatic Token Refresh**: Frontend automatically refreshes tokens every 14 minutes
-   **Development Environment**: Set `synchronize: true` for automatic schema synchronization
-   **Production Environment**: Migration required
-   **Google OAuth Setup**: Google OAuth client configuration required in `.env` file
-   **Date Format**: All dates in ISO 8601 format (UTC)

### Cookie Security Settings

```typescript
// Development Environment
sameSite: 'strict'
secure: false
httpOnly: true (for tokens)

// Production Environment
sameSite: 'strict'
secure: true
httpOnly: true (for tokens)
```

---

## Update Log

-   **v1.0.0** (2025-07-15): JWT + Refresh Token authentication system implementation

    -   HttpOnly cookie-based secure token management
    -   Automatic token refresh (14-minute intervals)
    -   Google OAuth-only social login
    -   Enhanced security against XSS/CSRF attacks
    -   User CRUD operations (social login-based)
    -   Soft delete and restore functionality

-   **v0.0.1** (2024-01-01): Initial API implementation
    -   Basic user CRUD operations
    -   Google OAuth authentication foundation
    -   Basic JWT token authentication
