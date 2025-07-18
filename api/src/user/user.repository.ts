import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, AuthProvider } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

/**
 * User Data Access Layer (Repository Pattern)
 * - Database CRUD operations using TypeORM
 * - Soft Delete support
 * - Google OAuth user creation support
 */
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // ===== Basic CRUD - Data Access =====

  /** Find active user by ID */
  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDeleted: false },
    });
  }

  /** Create new user */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  /** Update user information */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return this.findById(id);
  }

  /** Soft delete user */
  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.update(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    return (result.affected ?? 0) > 0;
  }

  // ===== Conditional Queries - Data Access =====

  /** Find all active users (admin only) */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  /** Find active user by email */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, isDeleted: false },
    });
  }

  /** Find active user by username */
  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username, isDeleted: false },
    });
  }

  /** Find active user by Google ID */
  async findByGoogleId(googleId: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { googleId, isDeleted: false },
    });
  }

  /** Find user by email (including deleted users) */
  async findByEmailIncludingDeleted(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  /** Find all deleted users */
  async findDeleted(): Promise<User[]> {
    return this.userRepository.find({
      where: { isDeleted: true },
    });
  }

  /** Find deleted user by ID */
  async findDeletedById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDeleted: true },
    });
  }

  // ===== Special Operations - Data Access =====

  /** Create Google OAuth user */
  async createGoogleUser(userData: {
    email: string;
    nickname: string;
    username: string;
    googleId: string;
    profilePicture?: string;
  }): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      provider: AuthProvider.GOOGLE,
    });
    return this.userRepository.save(user);
  }

  /** Permanently delete user */
  async hardDelete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /** Restore deleted user */
  async restore(id: number): Promise<boolean> {
    const result = await this.userRepository.update(id, {
      isDeleted: false,
      deletedAt: undefined,
    });
    return (result.affected ?? 0) > 0;
  }

  // ===== Utility Methods =====

  /** Check if user exists (active users only) */
  async exists(id: number): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { id, isDeleted: false },
    });
    return count > 0;
  }

  /** Count active users */
  async count(): Promise<number> {
    return this.userRepository.count({
      where: { isDeleted: false },
    });
  }
}

// TODO: Add user search functionality (search by name, email, nickname)
// TODO: Add pagination support
// TODO: Add user role-based query functionality
// TODO: Add recent login time update functionality
// TODO: Add user activity log functionality
