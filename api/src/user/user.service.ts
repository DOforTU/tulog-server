import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UpdateUserDto, UserDetails } from './user.dto';

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
  ) {}

  // ===== User Retrieval =====

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
    const user = await this.userRepository.findByEmail(email);
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

  /** Get user details including teams, followers, and following */
  async getUserDetailsById(id: number): Promise<UserDetails> {
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
      })) || [];

    // Transform following data
    const following =
      user.followings?.map((followingRel) => ({
        id: followingRel.following.id,
        nickname: followingRel.following.nickname,
        profilePicture: followingRel.following.profilePicture,
        isActive: followingRel.following.isActive,
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

  async findByIdIncludingInactive(id: number): Promise<User> {
    const user = await this.userRepository.findByIdIncludingInactive(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
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

  // ===== Find Methods - Simple Form: get user or null =====

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

  // ===== Special Operations - Update and Delete =====

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

      // Soft delete the user
      await queryRunner.query(
        'UPDATE "server_api"."user" SET "deletedAt" = NOW() WHERE "id" = $1',
        [id],
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

  // ===== Update User Information =====

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
}
