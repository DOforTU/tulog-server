import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User } from './user.entity';
import { UpdateUserDto } from './user.dto';

/**
 * User Business Logic Service
 * - User CRUD operations
 * - Google OAuth user management
 * - Soft Delete functionality
 * - Data validation
 */
@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  // ===== Basic CRUD - Domain Specific =====

  /** Get all active users */
  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  /** Get user by ID (throws exception) */
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  /** Update user information */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Business logic: Check user existence
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Business logic: Username duplication check (with other users)
    if (
      updateUserDto.nickname &&
      updateUserDto.nickname !== existingUser.nickname
    ) {
      const userWithUsername = await this.findByNickname(
        updateUserDto.nickname,
      );
      if (userWithUsername) {
        throw new ConflictException('nickname already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }

    return updatedUser;
  }

  /** Update user password */
  async updatePassword(id: number, hashedNewPassword: string): Promise<User> {
    // Business logic: Update user password
    const updatedUser = await this.userRepository.updatePassword(
      id,
      hashedNewPassword,
    );

    if (!updatedUser) {
      throw new Error(`Failed to update password for user with ID ${id}`);
    }

    return updatedUser;
  }

  /** Soft delete user */
  async deleteUser(id: number): Promise<boolean> {
    // Check user existence
    await this.getUserById(id);

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new Error(`Failed to delete user with ID ${id}`);
    }
    return deleted;
  }

  // ===== Query Methods - Domain Specific =====

  /** Get user by email (with throws exception, can get no isActive user) */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /** Get user by nickname(throws exception) */
  async getUserByNickname(nickname: string): Promise<User | null> {
    const user = await this.userRepository.findByNickname(nickname);
    if (!user) {
      throw new NotFoundException(`User with nickname ${nickname} not found`);
    }
    return user;
  }

  /** Get deleted users list */
  async getDeletedUsers(): Promise<User[]> {
    return this.userRepository.findDeleted();
  }

  /** Get active user count */
  async getUserCount(): Promise<number> {
    return this.userRepository.count();
  }

  // ===== Business Logic - Verb-Centric =====

  /** Permanently delete user */
  async hardDeleteUser(id: number): Promise<void> {
    // Business logic: Check user existence (including deleted users)
    const user = await this.userRepository.findDeletedById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deleted = await this.userRepository.hardDelete(id);
    if (!deleted) {
      throw new Error(`Failed to permanently delete user with ID ${id}`);
    }
  }

  /** Restore deleted user */
  async restoreUser(id: number): Promise<User> {
    // Business logic: Check deleted user existence
    const deletedUser = await this.userRepository.findDeletedById(id);
    if (!deletedUser) {
      throw new NotFoundException(`Deleted user with ID ${id} not found`);
    }

    const restored = await this.userRepository.restore(id);
    if (!restored) {
      throw new Error(`Failed to restore user with ID ${id}`);
    }

    const restoredUser = await this.userRepository.findById(id);
    if (!restoredUser) {
      throw new Error(`Failed to retrieve restored user with ID ${id}`);
    }

    return restoredUser;
  }

  /** Activate user account */
  async activateUser(id: number): Promise<User> {
    // Business logic: Check user existence
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Business logic: Check if already active
    if (existingUser.isActive) {
      throw new Error(`User with ID ${id} is already active`);
    }

    const updatedUser = await this.userRepository.update(id, {
      isActive: true,
    });
    if (!updatedUser) {
      throw new Error(`Failed to activate user with ID ${id}`);
    }

    return updatedUser;
  }

  // ===== Internal Helper Methods - Simple Form =====

  /** Find active user by email (nullable) */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /** Find active user by email with password (for login) */
  async findWithPasswordByEmail(email: string): Promise<User | null> {
    return this.userRepository.findWithPasswordByEmail(email);
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return this.userRepository.findByNickname(nickname);
  }

  /** Find active user by ID (nullable) */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /** Find active user by sub (used in JWT validation) */
  async findBySub(sub: number): Promise<User | null> {
    return this.userRepository.findBySub(sub);
  }

  /** Find user by email (with deleted users) */
  async findIncludingDeletedByEmail(email: string): Promise<User | null> {
    return this.userRepository.findIncludingDeletedByEmail(email);
  }

  /** Find user by nickname (including no active users) */
  async findIncludingNoActiveByNickname(
    nickname: string,
  ): Promise<User | null> {
    return await this.userRepository.findIncludingNoActiveByNickname(nickname);
  }

  /** Find User with Followers by Id */
  async findByIdWithFollowers(id: number): Promise<User | null> {
    return this.userRepository.findByIdWithFollowers(id);
  }

  /** Find User with Followings by Id */
  async findByIdWithFollowings(id: number): Promise<User | null> {
    return this.userRepository.findByIdWithFollowings(id);
  }

  /** Find User with Blocked user by Id*/
  async findWithBlockedById(id: number): Promise<User | null> {
    return this.userRepository.findWithBlockedById(id);
  }
}

// TODO: Expand social login providers (Kakao, Naver, etc.)
// TODO: Handle user profile image upload
// TODO: Implement user permission management system
// TODO: Add account lock/unlock functionality
// TODO: Add user activity log recording functionality
// TODO: Add user search and filtering functionality
// TODO: Add multi-social account linking functionality (Google + Kakao, etc.)
