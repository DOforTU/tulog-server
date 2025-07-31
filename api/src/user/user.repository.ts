import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateUserDto } from './user.dto';

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
    return await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  /** Update user information */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return await this.findById(id);
  }

  /** Update user Password */
  async updatePassword(
    id: number,
    hashedNewPassword: string,
  ): Promise<User | null> {
    await this.userRepository.update(id, {
      password: hashedNewPassword,
    });
    return await this.findById(id);
  }

  /** Soft delete user */
  async delete(id: number): Promise<boolean> {
    const result = await this.userRepository.update(id, {
      isActive: false,
      deletedAt: new Date(),
    });
    return (result.affected ?? 0) > 0;
  }

  // ===== Conditional Queries - Data Access =====

  /** Find all active users (admin only) */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /** Find active user by email */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  /** Find active user by username */
  async findByName(name: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { name, deletedAt: IsNull() },
    });
  }

  async findByNickname(nickname: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { nickname, deletedAt: IsNull() },
    });
  }

  /** Find user by email (including deleted users) */
  async findByEmailIncludingDeleted(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  /** Find all deleted users */
  async findDeleted(): Promise<User[]> {
    return await this.userRepository.find({
      where: { deletedAt: Not(IsNull()) },
    });
  }

  /** Find deleted user by ID */
  async findDeletedById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
  }

  /** Find User with password */
  async findWithPasswordById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      select: ['id', 'email', 'password'],
    });
  }

  /** Find User with Followers */
  async findWithFollowersById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['followers', 'followers.follower'],
    });
  }

  /** Find user with Followings */
  async findWithFollowingsById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['followings', 'followings.following'],
    });
  }

  // ===== Special Operations - Data Access =====

  /** Permanently delete user */
  async hardDelete(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /** Restore deleted user */
  async restore(id: number): Promise<boolean> {
    const result = await this.userRepository
      .createQueryBuilder()
      .update()
      .set({ isActive: true, deletedAt: null })
      .where('id = :id', { id })
      .execute();
    return (result.affected ?? 0) > 0;
  }

  // ===== Utility Methods =====

  /** Check if user exists (active users only) */
  async exists(id: number): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { id, deletedAt: IsNull() },
    });
    return count > 0;
  }

  /** Count active users */
  async count(): Promise<number> {
    return await this.userRepository.count({
      where: { deletedAt: IsNull() },
    });
  }
}

// TODO: Add user search functionality (search by name, email, nickname)
// TODO: Add pagination support
// TODO: Add user role-based query functionality
// TODO: Add recent login time update functionality
// TODO: Add user activity log functionality
