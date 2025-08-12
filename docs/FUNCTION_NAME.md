# 함수명 명명 규칙

## find & get 차이

> User로 예시

-   `find()`: 데이터가 Null이라도 무조건 반환 (User | Null)
-   `get()`: 데이터가 없다면 예외처리, 무조건 User 반환
    -   따라서 `get`은 보통 `Service` 계층에서만 쓰임

**예시**

```ts
async getUserById(id: number): Promise<User>:
    const user = await this.userRepository.findById(id);
    if(!user) {
        throw new  NotFoundException(`User with ID ${id} not found`)
    };

    return user;
```

위 예시를 보면 `findById`의 경우 Null일 수도 있음. 하지만 `Service` 계층에서 예외처리를 하여 해당 함수는 무조건 `User`를 반환함.

## Repository 계층 함수 명명 규칙

`Repository`계층은 보통 같은 모듈의 `Service`에서만 불러오기 때문에 다음과 같이 명사를 제거한다.

-   `createUser()` ❌ → `create()` ✅
-   `updateUser()` ❌ → `updateById()` ✅
-   `findUserById()` ❌ → `findById()` ✅

아래와 같이 함수 목적은 같지만 조건이 있는 경우 조건도 같이 함수명에 포함한다.

-   `findByIdWithPassword()` ✅

또한 함수 위에 간단하게라도 주석으로 설명을 적고, 특징을 적는다.

```ts
  /**
   * Find user by ID (ONLY not-deleted & active)
   * @param id
   * @returns
   */
  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: IsNull(), isActive: true },
    });
  }
```

위 예시처럼 `@param id` 등 자세히는 작성할 필요 없고, 역할과 필터링 조건 등만 포함해도 괜찮음.

-   **format**:

```
/**
 * 기능 설명 + (특이사항/제한 조건)
 */
```

VSCode에서는 자동 JSDoc을 생성해주니 잘 활용하면 좋음.

```
/** + Enter
```

## Service 계층 함수 명명 규칙

> `get()`: 데이터를 무조건 반환하거나, 없을 경우 예외를 throw

```ts
getUserById(id: number): Promise<User>
getPostBySlug(slug: string): Promise<Post>
getTeamByName(name: string): Promise<Team>
getCommentById(id: number): Promise<Comment>
```

> `create()`: 새로운 엔티티나 상태 생성

```ts
createUser(createUserDto: CreateUserDto): Promise<User>
createPost(createPostDto: CreatePostDto): Promise<Post>
createTeam(name: string, creatorId: number): Promise<Team>
createComment(authorId: number, postId: number, content: string): Promise<Comment>
```

> `delete*()` / `softDelete*()`: 완전 삭제 또는 soft-delete 처리

```ts
deleteUserById(id: number): Promise<void>
softDeletePostById(postId: number): Promise<void>
deleteCommentById(commentId: number): Promise<void>
softDeleteTeamById(teamId: number): Promise<void>
```

> `validate\*()`: 조건 확인 / 검증 (예외 발생 가능)

```ts
validatePassword(userId: number, inputPassword: string): Promise<void>
validateAccessToken(token: string): Promise<JwtPayload>
validateTeamJoinable(teamId: number, userId: number): Promise<void>
validateUserOwnership(userId: number, resourceId: number): Promise<void>
```

> `check*()` / `has*()` / `is*()`: boolean 반환 (조건 만족 여부 판단)

```ts
checkEmailDuplicated(email: string): Promise<boolean>
hasJoinedTeam(userId: number, teamId: number): Promise<boolean>
isTeamLeader(userId: number, teamId: number): Promise<boolean>
isPostVisibleToUser(userId: number, postId: number): Promise<boolean>
```

## Controller 계층 함수 명명 규칙

> 컨트롤러도 서비스처럼 **동사+명사+By+요소**로 구성됨

```ts
  /** Get user by id or nickname (query) */
  @Get()
  async getUserByIdOrNickname(
    @Query('id') id?: string,
    @Query('nickname') nickname?: string,
  ): Promise<User | null> {
    if (id) {
      const idNum = Number(id);
      if (!isNaN(idNum)) {
        return this.userService.getUserById(idNum);
      }
    }
    if (nickname) {
      return this.userService.getUserByNickname(nickname);
    }
    return null;
  }
```
