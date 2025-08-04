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

---

### Get Team by Name

> team/team.controller.ts  
> **`GET /api/teams/name/:name`**

-   특정 팀의 상세 정보를 이름으로 조회한다.

---

### Get Team Members

> team/team-member.controller.ts  
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

## Team Actions

### Invite Member

> team/team-member.controller.ts  
> **`POST /api/teams/:teamId/invite?userId=:userId`**

-   팀장이 특정 사용자를 팀에 초대한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "teamId": 10,
        "memberId": 5,
        "status": "INVITED"
    },
    "timestamp": "2025-08-03T12:20:00.000Z",
    "path": "/api/teams/10/invite"
}
```

---

### Request to Join Team

> team/team-member.controller.ts  
> **`POST /api/teams/:id/join`**

-   사용자가 팀에 가입 요청을 보낸다.

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "teamId": 10,
        "memberId": 5,
        "status": "PENDING"
    },
    "timestamp": "2025-08-03T12:22:00.000Z",
    "path": "/api/teams/10/join"
}
```

---

### Change Team Info

> team/team.controller.ts  
> **`PATCH /api/teams/:id`**

-   팀장이 팀 정보(이름, 소개, 상태 여부 등)를 수정한다.

-   **Request Body**:

```json
{
    "name": "새로운팀이름",
    "introduction": "소개 수정",
    "status": "ONLY_INVITE"
}
```

---

### Kick Member

> team/team-member.controller.ts  
> **`DELETE /api/teams/:teamId/kick?userId=:userId`**

-   팀장이 특정 팀원을 강제 탈퇴시킨다.

-   **Success Response**:

```json
{
    "success": true,
    "data": true,
    "timestamp": "2025-08-03T12:25:00.000Z",
    "path": "/api/teams/10/kick"
}
```

---

### Leave Team

> team/team-member.controller.ts  
> **`DELETE /api/teams/:id/leave`**

-   사용자가 팀을 탈퇴한다.
-   팀원이 1명만 남을 경우 팀은 자동 삭제된다.
-   팀장이 나가려면 리더 위임이 선행되어야 한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": true,
    "timestamp": "2025-08-03T12:30:00.000Z",
    "path": "/api/teams/10/leave"
}
```

---

### Transfer Leadership

> team/team-member.controller.ts  
> **`PATCH /api/teams/:teamId/transfer-leader?userId=:userId`**

-   팀장이 팀장 권한을 다른 사용자에게 위임한다.

-   **Success Response**:

```json
{
    "success": true,
    "data": {
        "teamId": 1,
        "memberId": 5,
        "isLeader": true
    },
    "timestamp": "2025-08-03T12:35:00.000Z",
    "path": "/api/teams/10/transfer-leader"
}
```
