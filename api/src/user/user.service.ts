import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UserRepository } from './user.repository';
import { User, AuthProvider } from './user.entity';
import { UpdateUserDto } from './user.dto';

/** Google OAuth user data interface */
interface GoogleUserData {
  googleId: string;
  email: string;
  nickname: string;
  username: string;
  profilePicture?: string;
}

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

  /** Create user */
  async createUser(userData: GoogleUserData): Promise<User> {
    // Check for email duplication only among non-deleted users
    const existingActiveUser = await this.userRepository.findByEmail(
      userData.email,
    );
    if (existingActiveUser) {
      throw new ConflictException('Email already exists');
    }

    return this.userRepository.createGoogleUser(userData);
  }

  /** Update user information */
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // Business logic: Check user existence
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Business logic: Email duplication check (with other users)
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(
        updateUserDto.email,
      );
      if (userWithEmail) {
        throw new ConflictException('Email already exists');
      }
    }

    // Business logic: Username duplication check (with other users)
    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.name
    ) {
      const userWithUsername = await this.userRepository.findByName(
        updateUserDto.username,
      );
      if (userWithUsername) {
        throw new ConflictException('Username already exists');
      }
    }

    const updatedUser = await this.userRepository.update(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException(`Failed to update user with ID ${id}`);
    }

    return updatedUser;
  }

  /** Soft delete user */
  async deleteUser(id: number): Promise<void> {
    // Business logic: Check user existence
    const userExists = await this.userRepository.exists(id);
    if (!userExists) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const deleted = await this.userRepository.delete(id);
    if (!deleted) {
      throw new Error(`Failed to delete user with ID ${id}`);
    }
  }

  // ===== Query Methods - Domain Specific =====

  /** Get user by email (throws exception) */
  async getUserByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  /** Get user by Google ID */
  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findByGoogleId(googleId);
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

  /** Create Google OAuth user */
  async createGoogleUser(googleUserData: GoogleUserData): Promise<User> {
    // Check for email duplication only among non-deleted users
    // Deleted users can create new accounts
    const existingActiveUser = await this.userRepository.findByEmail(
      googleUserData.email,
    );
    if (existingActiveUser) {
      throw new ConflictException('Email already exists');
    }

    // Create new account even if deleted users exist
    return this.userRepository.createGoogleUser(googleUserData);
  }

  /** Link Google account to existing account */
  async linkGoogleAccount(
    userId: number,
    linkData: { googleId: string; profilePicture?: string },
  ): Promise<User> {
    const updateData = {
      googleId: linkData.googleId,
      profilePicture: linkData.profilePicture,
      provider: AuthProvider.GOOGLE,
    };

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundException(
        `Failed to link Google account for user ${userId}`,
      );
    }

    return updatedUser;
  }

  // ===== Internal Helper Methods - Simple Form =====

  /** Find active user by email (nullable) */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findByEmail(email);
  }

  /** Find active user by ID (nullable) */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  /** Find user by email (including deleted users) */
  async findByEmailIncludingDeleted(email: string): Promise<User | null> {
    return this.userRepository.findByEmailIncludingDeleted(email);
  }

  /** Find user by Google ID */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findByGoogleId(googleId);
  }
}

// TODO: Expand social login providers (Kakao, Naver, etc.)
// TODO: Handle user profile image upload
// TODO: Implement user permission management system
// TODO: Add account lock/unlock functionality
// TODO: Add user activity log recording functionality
// TODO: Add user search and filtering functionality
// TODO: Add multi-social account linking functionality (Google + Kakao, etc.)
