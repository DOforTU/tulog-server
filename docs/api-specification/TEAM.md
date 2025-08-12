# Team API

> ⚠️ 모든 에러 응답은 아래와 같음:  
> `{ success: false, statusCode, message (string array), error, timestamp, path }`

---

## Team Management

### Create Team

> team/team.controller.ts  
> **`POST /api/teams`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   새로운 팀을 생성한다. 팀 이름과 최대 인원을 지정할 수 있다.
-   기본적으로 생성한 사용자는 팀장이 된다.

-   **Request Body**:

```json
{
    "name": "블로그팀",
    "introduction": "개발 블로그 팀입니다.",
    "maxMembers": 5
}
```

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "id": 10,
        "name": "블로그팀",
        "introduction": "개발 블로그 팀입니다.",
        "maxMembers": 5,
        "isPrivate": false,
        "createdAt": "2025-08-03T12:00:00.000Z"
    },
    "timestamp": "2025-08-03T12:00:00.000Z",
    "path": "/api/teams"
}
```

### Get Team by ID

> team/team.controller.ts  
> **`GET /api/teams/:id`**

-   특정 팀의 상세 정보를 ID로 조회한다.
-   팀 정보와 함께 팀원 목록도 포함된다.

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "id": 10,
        "name": "블로그팀",
        "introduction": "개발 블로그 팀입니다.",
        "maxMembers": 5,
        "image": "http://localhost:8000/uploads/team-image/default-team.png",
        "isPrivate": false,
        "createdAt": "2025-08-03T12:00:00.000Z",
        "members": [
            {
                "id": 1,
                "nickname": "팀장",
                "profilePicture": "https://example.com/avatar.jpg",
                "isActive": true,
                "role": "leader"
            }
        ]
    },
    "timestamp": "2025-08-03T12:15:00.000Z",
    "path": "/api/teams/10"
}
```

---

### Get Team by Name

> team/team.controller.ts  
> **`GET /api/teams/name/:name`**

-   특정 팀의 상세 정보를 이름으로 조회한다.
-   팀 정보와 함께 팀원 목록도 포함된다 (PublicTeam 형태).

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "id": 10,
        "name": "블로그팀",
        "introduction": "개발 블로그 팀입니다.",
        "maxMembers": 5,
        "image": "http://localhost:8000/uploads/team-image/default-team.png",
        "isPrivate": false,
        "createdAt": "2025-08-03T12:00:00.000Z",
        "members": [
            {
                "id": 1,
                "nickname": "팀장",
                "profilePicture": "https://example.com/avatar.jpg",
                "isActive": true
            }
        ]
    },
    "timestamp": "2025-08-03T12:15:00.000Z",
    "path": "/api/teams/name/블로그팀"
}
```

---

### Update Team Info

> team/team.controller.ts  
> **`PATCH /api/teams/:id`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   팀장만 팀 정보(이름, 소개, 이미지 등)를 수정할 수 있다.

-   **Request Body**:

```json
{
    "name": "새로운팀이름",
    "introduction": "수정된 소개",
    "image": "http://localhost:8000/uploads/team-image/new-image.jpg"
}
```

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "id": 10,
        "name": "새로운팀이름",
        "introduction": "수정된 소개",
        "image": "http://localhost:8000/uploads/team-image/new-image.jpg",
        "maxMembers": 5,
        "isPrivate": false,
        "updatedAt": "2025-08-03T12:30:00.000Z"
    },
    "timestamp": "2025-08-03T12:30:00.000Z",
    "path": "/api/teams/10"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 403,
    "message": ["Only team leader can update team information"],
    "error": "FORBIDDEN",
    "timestamp": "2025-08-03T12:30:00.000Z",
    "path": "/api/teams/10"
}
```

-   **예외 체크리스트 (✅ 또는 ❌):**
    -   팀장이 아닌 사용자가 요청한 경우 → 403 Forbidden ✅
    -   존재하지 않는 팀 ID인 경우 → 404 Not Found ✅

---

### Get Team Members

> team/team.controller.ts  
> **`GET /api/teams/:id/members`**

-   특정 팀의 팀원 목록을 조회한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "nickname": "리더",
            "profilePicture": "https://github.com/DOforTU/tulog/blob/main/img/user-profile/default-avatar.png?raw=true",
            "isLeader": true
        },
        {
            "id": 2,
            "nickname": "팀원1",
            "profilePicture": "https://github.com/DOforTU/tulog/blob/main/img/user-profile/default-avatar.png?raw=true",
            "isLeader": false
        }
    ],
    "timestamp": "2025-08-03T12:15:00.000Z",
    "path": "/api/teams/10/members"
}
```

---

## Team Invitation & Join System

### Invite Member to Team

> team-member/team-member.controller.ts  
> **`POST /api/teams/:teamId/members/:memberId/invite`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   팀장이 특정 사용자를 팀에 초대한다.
-   초대받은 사용자에게 자동으로 알림이 전송된다.

-   **Success Response**:

```json
{
    "teamId": 10,
    "memberId": 5,
    "status": "INVITED",
    "createdAt": "2025-08-03T12:20:00.000Z"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 403,
    "message": ["Only team leaders can invite members"],
    "error": "FORBIDDEN",
    "timestamp": "2025-08-03T12:20:00.000Z",
    "path": "/api/teams/10/members/5/invite"
}
```

-   **예외 체크리스트:**
    -   팀장이 아닌 사용자가 요청한 경우 → 403 Forbidden ✅
    -   이미 팀원이거나 초대된 사용자인 경우 → 409 Conflict ✅
    -   존재하지 않는 사용자를 초대한 경우 → 404 Not Found ✅

---

### Request to Join Team

> team-member/team-member.controller.ts  
> **`POST /api/teams/:teamId/join`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   사용자가 팀에 참여를 요청한다.
-   팀 리더에게 자동으로 알림이 전송된다.

-   **Success Response**:

```json
{
    "teamId": 10,
    "memberId": 5,
    "status": "PENDING",
    "createdAt": "2025-08-03T12:22:00.000Z"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 409,
    "message": ["Already a member or request pending"],
    "error": "CONFLICT",
    "timestamp": "2025-08-03T12:22:00.000Z",
    "path": "/api/teams/10/join"
}
```

-   **예외 체크리스트:**
    -   이미 팀원이거나 요청이 대기중인 경우 → 409 Conflict ✅
    -   존재하지 않는 팀인 경우 → 404 Not Found ✅

---

## Notification-Based Team Actions

### Accept Team Invitation

> team-member/team-member.controller.ts  
> **`POST /api/teams/:teamId/invitation/accept`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   초대받은 사용자가 팀 초대를 수락한다.
-   팀 리더에게 새 멤버 가입 알림이 전송된다.

-   **Success Response**:

```json
{
    "teamId": 10,
    "memberId": 5,
    "status": "JOINED",
    "joinedAt": "2025-08-03T12:25:00.000Z"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 404,
    "message": ["Team invitation not found"],
    "error": "NOT_FOUND",
    "timestamp": "2025-08-03T12:25:00.000Z",
    "path": "/api/teams/10/invitation/accept"
}
```

---

### Reject Team Invitation

> team-member/team-member.controller.ts  
> **`DELETE /api/teams/:teamId/invitation/reject`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   초대받은 사용자가 팀 초대를 거절한다.

-   **Success Response**:

```json
true
```

---

### Accept Team Join Request (Leader Only)

> team-member/team-member.controller.ts  
> **`POST /api/teams/:teamId/join-request/members/:memberId/accept`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   팀 리더만 팀 참여 요청을 수락할 수 있다.
-   요청자에게 수락 알림이 전송된다.

-   **Success Response**:

```json
{
    "teamId": 10,
    "memberId": 5,
    "status": "JOINED",
    "joinedAt": "2025-08-03T12:30:00.000Z"
}
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 403,
    "message": ["Only team leaders can accept join requests"],
    "error": "FORBIDDEN",
    "timestamp": "2025-08-03T12:30:00.000Z",
    "path": "/api/teams/10/join-request/members/5/accept"
}
```

---

### Reject Team Join Request (Leader Only)

> team-member/team-member.controller.ts  
> **`DELETE /api/teams/:teamId/join-request/members/:memberId/reject`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   팀 리더만 팀 참여 요청을 거절할 수 있다.

-   **Success Response**:

```json
true
```

---

## Team Member Management

### Leave Team

> team-member/team-member.controller.ts  
> **`DELETE /api/teams/:teamId/leave`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   사용자가 팀을 탈퇴한다.
-   팀 리더에게 탈퇴 알림이 전송된다.

-   **Success Response**:

```json
true
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 403,
    "message": ["Team leader cannot leave. Transfer leadership first."],
    "error": "FORBIDDEN",
    "timestamp": "2025-08-03T12:30:00.000Z",
    "path": "/api/teams/10/leave"
}
```

-   **예외 체크리스트:**
    -   팀장이 탈퇴를 시도한 경우 → 403 Forbidden ✅
    -   팀원이 아닌 사용자가 요청한 경우 → 404 Not Found ✅

---

### Kick Member

> team-member/team-member.controller.ts  
> **`DELETE /api/teams/:teamId/members/:memberId/kick`**

-   JWT 인증 & 활성화 인증이 필요하다.
-   팀장이 특정 팀원을 강제 탈퇴시킨다.
-   추방당한 사용자에게 추방 알림이 전송된다.

-   **Success Response**:

```json
true
```

-   **Failure Response**:

```json
{
    "success": false,
    "statusCode": 403,
    "message": ["Only team leader can kick members"],
    "error": "FORBIDDEN",
    "timestamp": "2025-08-03T12:25:00.000Z",
    "path": "/api/teams/10/members/5/kick"
}
```

-   **예외 체크리스트:**
    -   팀장이 아닌 사용자가 요청한 경우 → 403 Forbidden ✅
    -   존재하지 않는 팀원을 추방하려는 경우 → 404 Not Found ✅
    -   팀장이 자신을 추방하려는 경우 → 400 Bad Request ✅

---

## Team Member Status

### Status Types

| Status    | Description               | Available Actions            |
| --------- | ------------------------- | ---------------------------- |
| `INVITED` | 팀 리더가 초대한 상태     | Accept, Reject               |
| `PENDING` | 사용자가 참여 요청한 상태 | Leader Accept, Leader Reject |
| `JOINED`  | 정식 팀원 상태            | Leave, Get Kicked            |

### Status Flow

```mermaid
stateDiagram-v2
    [*] --> INVITED : Leader invites user
    [*] --> PENDING : User requests to join

    INVITED --> JOINED : User accepts invitation
    INVITED --> [*] : User rejects invitation

    PENDING --> JOINED : Leader accepts request
    PENDING --> [*] : Leader rejects request

    JOINED --> [*] : Leave team or get kicked
```
