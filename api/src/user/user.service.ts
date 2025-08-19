import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import {
  UpdateUserDto,
  UserDetails,
  PublicUser,
  UserDetailsById,
} from './user.dto';
import { toPublicUsers } from 'src/common/helper/to-public-user';

/**
 * User Business Logic Service
 * - User CRUD operations
 * - Google OAuth user management
 * - Soft Delete functionality
 * - Data validation
 */
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  // ===== READ =====

  /**
   * Get user by ID (throws exception)
   * @param id User ID
   * @returns User entity
   */
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /** Get user by email (with throws exception, can get no isActive user) */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.findUserByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /** Get user by nickname(throws exception) */
  async getUserByNickname(nickname: string): Promise<User> {
    const user = await this.userRepository.findByNickname(nickname);
    if (!user) {
      throw new NotFoundException(`User with nickname ${nickname} not found`);
    }
    return user;
  }

  /** Id로 가져올 때는 팀 리스트와 팔로우/팔로잉 사용자 정보도 같이 가져옴 */
  async getUserDetailsById(id: number): Promise<UserDetailsById> {
    const user = await this.findUserDetailsById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Transform teams data
    const teams =
      user.teamMembers?.map((teamMember) => ({
        team: teamMember.team,
        status: teamMember.status,
        isLeader: teamMember.isLeader,
      })) || [];

    // Transform followers data
    const followers =
      user.followers?.map((followerRel) => ({
        id: followerRel.follower.id,
        nickname: followerRel.follower.nickname,
        profilePicture: followerRel.follower.profilePicture,
        isActive: followerRel.follower.isActive,
        role: followerRel.follower.role,
      })) || [];

    // Transform following data
    const following =
      user.followings?.map((followingRel) => ({
        id: followingRel.following.id,
        nickname: followingRel.following.nickname,
        profilePicture: followingRel.following.profilePicture,
        isActive: followingRel.following.isActive,
        role: followingRel.following.role,
      })) || [];

    return {
      id: user.id,
      nickname: user.nickname,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      teams,
      followers,
      following,
    };
  }

  /** Nickname으로 가져올 때는 팀 리스트와 팔로우/팔로잉 카운트만 가져옴 */
  async getUserDetailsByNickname(nickname: string): Promise<UserDetails> {
    const user = await this.findUserDetailsByNickname(nickname);
    if (!user) {
      throw new NotFoundException(`User with nickname ${nickname} not found`);
    }

    // Transform teams data
    const teams =
      user.teamMembers?.map((teamMember) => ({
        team: teamMember.team,
        status: teamMember.status,
        isLeader: teamMember.isLeader,
      })) || [];

    // Transform followers data
    const followers =
      user.followers?.map((followerRel) => ({
        id: followerRel.follower.id,
        nickname: followerRel.follower.nickname,
        profilePicture: followerRel.follower.profilePicture,
        isActive: followerRel.follower.isActive,
        role: followerRel.follower.role,
      })) || [];

    // Transform following data
    const following =
      user.followings?.map((followingRel) => ({
        id: followingRel.following.id,
        nickname: followingRel.following.nickname,
        profilePicture: followingRel.following.profilePicture,
        isActive: followingRel.following.isActive,
        role: followingRel.following.role,
      })) || [];

    return {
      id: user.id,
      nickname: user.nickname,
      profilePicture: user.profilePicture,
      isActive: user.isActive,
      teams,
      followerCount: followers.length,
      followingCount: following.length,
    };
  }

  /**
   * Get popular authors based on recent activity (last 30 days)
   * @param limit Number of authors to return (default: 3)
   * @returns Array of popular authors
   */
  async getPopularAuthors(limit: number = 3): Promise<PublicUser[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const users = await this.userRepository.findPopularAuthorsByPeriod(
      thirtyDaysAgo,
      limit,
    );

    return toPublicUsers(users);
  }

  // ===== Admin Logic =====

  /**
   * Get active user count
   * @returns Number of active users
   */
  async getUserCount(): Promise<number> {
    return this.userRepository.countUsers();
  }

  async getDeletedUserById(id: number): Promise<User> {
    const user = await this.userRepository.findDeletedById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  // ===== UPDATE =====

  /**
   * Update user information
   * @param id User ID
   * @param updateUserDto Update user data
   * @returns Updated user entity
   */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Check user existence
    const existingUser = await this.getUserById(id);

    // Business logic: Username duplication check (with other users)
    if (
      updateUserDto.nickname &&
      updateUserDto.nickname !== existingUser.nickname
    ) {
      const userWithUsername = await this.findUserByNickname(
        updateUserDto.nickname,
      );
      if (userWithUsername) {
        throw new ConflictException('nickname already exists');
      }
    }
    const updatedUser = await this.userRepository.updateUser(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }

    return updatedUser;
  }

  /**
   * Update user password
   * @param id User ID
   * @param hashedNewPassword New hashed password
   * @returns Updated user entity
   */
  async updatePassword(id: number, hashedNewPassword: string): Promise<User> {
    // Check user existence
    await this.getUserById(id);

    // Business logic: Update user password
    const updatedUser = await this.userRepository.updatePasswordById(
      id,
      hashedNewPassword,
    );

    if (!updatedUser) {
      throw new Error(`Failed to update password for user with ID ${id}`);
    }

    return updatedUser;
  }

  /**
   * Activate user account
   * @param id User ID
   * @returns Activated user entity
   */
  async activateUser(id: number): Promise<User> {
    // Check user existence
    const existingUser = await this.findByIdIncludingInactive(id);

    // Business logic: Check if already active
    if (existingUser.isActive) {
      throw new Error(`User with ID ${id} is already active`);
    }

    const updatedUser = await this.userRepository.updateUser(id, {
      isActive: true,
    });
    if (!updatedUser) {
      throw new Error(`Failed to activate user with ID ${id}`);
    }

    return updatedUser;
  }

  /** Soft delete user */
  async deleteUser(id: number): Promise<boolean> {
    // Check user existence
    const user = await this.getUserDetailsById(id);

    if (user.teams.length > 0) {
      throw new ForbiddenException(
        `You have to leave all teams before deleting your account.`,
      );
    }

    // Use transaction to delete user and related follow relationships
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Anonymize user content before deletion
      await this.anonymizeUserContent(queryRunner, id);

      // Delete all follow relationships where user is follower
      await queryRunner.query(
        'DELETE FROM "server_api"."follow" WHERE "followerId" = $1',
        [id],
      );

      // Delete all follow relationships where user is being followed
      await queryRunner.query(
        'DELETE FROM "server_api"."follow" WHERE "followingId" = $1',
        [id],
      );

      // Soft delete and anonymize the user
      const defaultAvatarUrl = this.configService.get(
        'USER_DEFAULT_AVATAR_URL',
      );
      await queryRunner.query(
        `UPDATE "server_api"."user" SET 
         "deletedAt" = NOW(), 
         "nickname" = 'Deleted User', 
         "profilePicture" = $2, 
         "isActive" = false 
         WHERE "id" = $1`,
        [id, defaultAvatarUrl],
      );

      await queryRunner.commitTransaction();
      return true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to delete user with ID ${id}: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Restore deleted user
   * @param id User ID
   * @returns Restored user entity
   */
  async restoreUser(id: number): Promise<User> {
    // Check deleted user existence
    await this.getDeletedUserById(id);

    const restored = await this.userRepository.restoreById(id);
    if (!restored) {
      throw new Error(`Failed to restore user with ID ${id}`);
    }

    const restoredUser = await this.userRepository.findById(id);
    if (!restoredUser) {
      throw new Error(`Failed to retrieve restored user with ID ${id}`);
    }

    return restoredUser;
  }

  // ===== DELETE =====
  /**
   * Permanently delete user
   * @param id User ID
   */
  async hardDeleteUser(id: number): Promise<void> {
    // Business logic: Check user existence (including deleted users)
    await this.getDeletedUserById(id);

    const deleted = await this.userRepository.hardDeleteById(id);
    if (!deleted) {
      throw new Error(`Failed to permanently delete user with ID ${id}`);
    }
  }

  // ===== SUB FUNCTION =====
  // Find Methods - Simple Form: get user or null
  /**
   *
   * @param userId 사용자가 팔로우한 팀을 조회
   *
   */
  async findMyFollowingTeams(userId: number): Promise<User | null> {
    const followingTeams = this.userRepository.findMyFollowingTeams(userId);
    return followingTeams;
  }

  async findByIdIncludingInactive(id: number): Promise<User> {
    const user = await this.userRepository.findByIdIncludingInactive(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /**
   * Get all users
   * @returns Array of user entities
   */
  async findAllUsers(): Promise<User[] | null> {
    return this.userRepository.findAll();
  }

  /**
   * Find active user by ID (nullable)
   * @param id User ID
   * @returns User entity or null
   */
  async findUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /**
   * Find active user by email (nullable)
   * @param email User email
   * @returns User entity or null
   */
  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findUserDetailsById(id: number): Promise<User | null> {
    return await this.userRepository.findByIdWithDetails(id);
  }

  async findUserDetailsByNickname(nickname: string): Promise<User | null> {
    return await this.userRepository.findByNicknameWithDetails(nickname);
  }

  /**
   * Find active user by email with password (for login)
   * @param email User email
   * @returns User entity or null
   */
  async findUserWithPasswordByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmailWithPassword(email);
  }

  /**
   * Find active user by nickname (nullable)
   * @param nickname User nickname
   * @returns User entity or null
   */
  async findUserByNickname(nickname: string): Promise<User | null> {
    return await this.userRepository.findByNickname(nickname);
  }

  /**
   * Find active user by sub (used in JWT validation)
   * @param sub User sub
   * @returns User entity or null
   */
  async findUserBySub(sub: number): Promise<User | null> {
    return await this.userRepository.findBySub(sub);
  }

  /**
   * Find user by email (with deleted users)
   * @param email User email
   * @returns User entity or null
   */
  async findUserIncludingDeletedByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmailIncludingDeleted(email);
  }

  /**
   * Find user by email (including no active users)
   * @param email User email
   * @returns User entity or null
   */
  async findUserIncludingNoActiveByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmailIncludingInactive(email);
  }

  /**
   * Find user by nickname (including no active users)
   * @param nickname User nickname
   * @returns User entity or null
   */
  async findUserIncludingNoActiveByNickname(
    nickname: string,
  ): Promise<User | null> {
    return await this.userRepository.findByNicknameIncludingInactive(nickname);
  }

  /**
   * Find user by ID (including followers)
   * @param id User ID
   * @returns User entity or null
   */
  async findUserByIdWithFollowers(id: number): Promise<User | null> {
    return this.userRepository.findByIdWithFollowers(id);
  }

  /**
   * Find user by ID (including followings)
   * @param id User ID
   * @returns User entity or null
   */
  async findUserByIdWithFollowings(id: number): Promise<User | null> {
    return this.userRepository.findByIdWithFollowings(id);
  }

  /**
   * Find user by ID (including blocked users)
   * @param id User ID
   * @returns User entity or null
   */
  async findUserWithBlockedById(id: number): Promise<User | null> {
    return await this.userRepository.findByIdWithBlocked(id);
  }

  /**
   * Find all deleted users
   * @returns Array of deleted user entities
   */
  async findDeletedUsers(): Promise<User[]> {
    return await this.userRepository.findAllDeleted();
  }

  async findUserInfo(userId: number): Promise<User | null> {
    return await this.userRepository.findUserInfo(userId);
  }

  /**
   * Anonymize user's content (posts, comments) before deletion
   * @param queryRunner Database transaction runner
   * @param userId User ID to anonymize
   */
  private async anonymizeUserContent(
    queryRunner: any,
    userId: number,
  ): Promise<void> {
    const userInfo = await this.userRepository.findUserInfo(userId);

    if (!userInfo) return;

    // 1. Hard delete all social relationships
    await queryRunner.query(
      'DELETE FROM "server_api"."follow" WHERE "followerId" = $1 OR "followingId" = $1',
      [userId],
    );

    await queryRunner.query(
      'DELETE FROM "server_api"."user_block" WHERE "blockerId" = $1 OR "blockedId" = $1',
      [userId],
    );

    await queryRunner.query(
      'DELETE FROM "server_api"."team_follow" WHERE "userId" = $1',
      [userId],
    );

    // 2. Update editor roles to VIEWER for all posts
    if (userInfo.editors && userInfo.editors.length > 0) {
      const editorPostIds = userInfo.editors.map((editor) => editor.postId);
      await queryRunner.query(
        'UPDATE "server_api"."editor" SET "role" = $1 WHERE "postId" = ANY($2) AND "userId" = $3',
        ['VIEWER', editorPostIds, userId],
      );
    }

    // 3. Set authorId to NULL for comments (break FK relationship)
    if (userInfo.comments && userInfo.comments.length > 0) {
      const commentIds = userInfo.comments.map((comment) => comment.id);
      await queryRunner.query(
        'UPDATE "server_api"."comment" SET "authorId" = NULL WHERE "id" = ANY($1)',
        [commentIds],
      );
    }

    // Note: User will be anonymized in the main deleteUser function
  }
}
