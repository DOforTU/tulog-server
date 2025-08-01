## Authentication

> auth/auth.controller.ts

### Google OAuth Login

- **Start Google OAuth Login**
  - `GET /api/auth/google`
  - Redirects user to Google for authentication.

- **Google OAuth Callback**
  - `GET /api/auth/google/callback`
  - Handles Google callback, issues JWT tokens, and redirects to frontend.

### Local Login

- **Sign Up (Local Account)**
  - `POST /api/auth/singup`
  - Request Body: `{ email, password, name, nickname }`
  - Registers a new user with local credentials.

- **Send Email Verification Code**
  - `POST /api/auth/send-email-code`
  - Request Body: `{ email }`
  - Sends a verification code to the provided email address.

### Token Management

- **Refresh Access Token**
  - `POST /api/auth/refresh`
  - Requires refresh token in HttpOnly cookie.
  - Issues a new access token if the refresh token is valid.

- **Logout**
  - `POST /api/auth/logout`
  - Clears authentication cookies and logs out the user.

---

## User Management API

> user/user.controller.ts

### User Lookup

- **Get Current User Info**
  - `GET /api/users/me`
  - Requires JWT authentication.
  - Returns the currently logged-in user's information.

- **Get User by ID**
  - `GET /api/users/:id`
  - Returns user information for the given user ID.

- **Get User by Nickname**
  - `GET /api/users/nickname/:nickname`
  - Returns user information for the given nickname.

- **Get User by ID or Nickname (Query)**
  - `GET /api/users?id={id}` or `GET /api/users?nickname={nickname}`
  - Returns user information by query parameter.

- **Get All Users**
  - `GET /api/users`
  - Returns a list of all active users.

### User Update & Deletion

- **Update Password**
  - > auth/auth.controller.ts
  - `PATCH /api/auth/password`
  - Requires JWT authentication (access token).
  - Request Body: `{ oldPassword, newPassword }`
  - Updates the user's password.
  - **Only Local user available.**

- **Update User Info**
  - `PATCH /api/users/me`
  - Requires JWT authentication.
  - Request Body: `{ name, nickname, ... }`
  - Updates the current user's information.

- **Soft Delete User**
  - `PATCH /api/users/me/delete`
  - Requires JWT authentication.
  - Soft deletes the current user's account.

- **Permanently Delete User (Admin)**
  - `DELETE /api/users/:id/hard`
  - Requires admin privileges.
  - Permanently deletes the user with the given ID.

- **Restore Deleted User (Admin)**
  - `PATCH /api/users/:id/restore`
  - Requires admin privileges.
  - Restores a previously deleted user.

### User Statistics

- **Get Deleted Users List**
  - `GET /api/users/deleted`
  - Returns a list of soft-deleted users.

- **Get Active User Count**
  - `GET /api/users/count`
  - Returns the number of active users.

---

## Follow User API

> follow/follow.controller.ts

### My Follow Info

- **Get My Followers**
  - `GET /api/users/me/followers`
  - Requires JWT authentication.
  - Returns a list of users who follow the current user.

- **Get My Followings**
  - `GET /api/users/me/followings`
  - Requires JWT authentication.
  - Returns a list of users the current user is following.

### Follow/Unfollow Actions

- **Follow a User**
  - `POST /api/users/:id/follow`
  - Requires JWT authentication.
  - Follows the user with the given ID.

- **Unfollow a User**
  - `DELETE /api/users/:id/unfollow`
  - Requires JWT authentication.
  - Unfollows the user with the given ID.

### User Follow Info

- **Get Followers of a User**
  - `GET /api/users/:id/followers`
  - Returns a list of users who follow the user with the given ID.

- **Get Followings of a User**
  - `GET /api/users/:id/followings`
  - Returns a list of users the user with the given ID is following.

---

## Team API

> team/team.controller.ts

### Team Management

- **Create Team**
  - `POST /api/teams`
  - Creates a new team (can specify max members).

- **Get Team List**
  - `GET /api/teams`
  - Retrieves a list of all teams.

- **Get Team Members**
  - > team/team-member.controller.ts
  - `GET /api/teams/:id/members`
  - Retrieves team members

- **Get Team by ID**
  - `GET /api/teams/:id`
  - Retrieves detailed information for a specific team by ID.

- **Get Team by Name**
  - `GET /api/teams/name/:name`
  - Retrieves detailed information for a specific team by name.

### Team Actions

- **Invite Member**
  - > team/team-member.controller.ts
  - `POST /api/teams/:teamId/invite?uuserIdser=:userId`
  - Invites a user to the team.

- **Request to Join Team**
  - > team/team-member.controller.ts
  - `POST /api/teams/:id/join`
  - Requests to join a team.

- **Change Team Info**
  - `PATCH /api/teams/:id`
  - Changes the team's information.(e.g., name, introduction )
  - also can change the team's visibility (e.g., invite-only).

- **Kick Member**
  - > team/team-member.controller.ts
  - `PATCH /api/teams/:teamId/kick?userId=:userId`
  - Kicks a member from the team (team leader only).

- **Leave Team**
  - > team/team-member.controller.ts
  - `PATCH /api/teams/:id/leave`
  - Leaves the team.
  - If only one member remains, the team is deleted.
  - If the leader leaves, a new leader must be assigned first.

- **Transfer Leadership**
  - > team/team-member.controller.ts
  - `PATCH /api/teams/:teamId/transfer-leader?userId=:userId`
  - me --> userId
  - Transfers team leader privileges to another member.

### Team Follow

- **Follow Team**
  - > follow/team-follow.controller.ts
  - `POST /api/teams/:id/follow`
  - Follows a team (user follows a team).

- **Unfollow Team**
  - > follow/team-follow.controller.ts
  - `DELETE /api/teams/:id/follow`
  - Unfollows a team.

---

## Block API

### User Block

> block/user-block.controller.ts

- **Block a User**
  - `POST /api/users/:id/block`
  - Blocks the user with the given ID (prevents interaction, hides content, etc).
  - Requires JWT authentication.

- **Unblock a User**
  - `DELETE /api/users/:id/block`
  - Unblocks the user with the given ID.
  - Requires JWT authentication.

- **Get My Blocked Users**
  - `GET /api/users/me/blocks`
  - Returns a list of users blocked by the current user.
  - Requires JWT authentication.

### Team Block

> block/team-block.controller.ts

- **Block a Team**
  - `POST /api/teams/:id/block`
  - Blocks the team with the given ID (prevents team content from appearing, etc).
  - Requires JWT authentication.

- **Unblock a Team**
  - `DELETE /api/teams/:id/block`
  - Unblocks the team with the given ID.
  - Requires JWT authentication.

- **Get My Blocked Teams**
  - `GET /api/teams/me/blocks`
  - Returns a list of teams blocked by the current user.
  - Requires JWT authentication.

---
