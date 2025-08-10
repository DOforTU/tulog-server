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

  // ===== User Retrieval =====

  /**
   * Find user by ID (ONLY active & not-deleted)
   * @param id User ID
   * @returns User entity or null
   */
  async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
        isActive: true,
      },
    });
  }

  /**
   * Find user by ID (including inactive users)
   * @param id User ID
   * @returns User entity or null
   */
  async findByIdIncludingInactive(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  /**
   * Find all users (admin only, active & not-deleted)
   * @returns Array of user entities
   */
  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find user by email (ONLY active & not-deleted)
   * @param email User email
   * @returns User entity or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, deletedAt: IsNull(), isActive: true },
    });
  }

  /**
   * Find user by email (including inactive users)
   * @param email User email
   * @returns User entity or null
   */
  async findByEmailIncludingInactive(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  /**
   * Find user by sub (used in JWT validation, ONLY active users)
   * @param sub User sub
   * @returns User entity or null
   */
  async findBySub(sub: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: sub, deletedAt: IsNull(), isActive: true },
    });
  }

  /**
   * Find user by sub (used in JWT validation, including inactive users)
   * @param sub User sub
   * @returns User entity or null
   */
  async findBySubIncludingInactive(sub: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: sub, deletedAt: IsNull() },
    });
  }

  /**
   * Find user by name (including inactive users)
   * @param name User name
   * @returns User entity or null
   */
  async findByNameIncludingInactive(name: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { name, deletedAt: IsNull() },
    });
  }

  /**
   * Find user by nickname (ONLY active & not-deleted)
   * @param nickname User nickname
   * @returns User entity or null
   */
  async findByNickname(nickname: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { nickname, deletedAt: IsNull(), isActive: true },
    });
  }

  /**
   * Find user by nickname (including inactive users)
   * @param nickname User nickname
   * @returns User entity or null
   */
  async findByNicknameIncludingInactive(
    nickname: string,
  ): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { nickname, deletedAt: IsNull() },
    });
  }

  /**
   * Find user by email (including deleted users)
   * @param email User email
   * @returns User entity or null
   */
  async findByEmailIncludingDeleted(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
    });
  }

  /**
   * Find all deleted users (admin only)
   * @returns Array of user entities
   */
  async findAllDeleted(): Promise<User[]> {
    return await this.userRepository.find({
      where: { deletedAt: Not(IsNull()) },
    });
  }

  /**
   * Find deleted user by ID
   * @param id User ID
   * @returns User entity or null
   */
  async findDeletedById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: Not(IsNull()) },
      withDeleted: true,
    });
  }

  /**
   * Find user by ID with password (including inactive users)
   * @param id User ID
   * @returns User entity with password or null
   */
  async findByIdWithPassword(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      select: ['id', 'email', 'password'],
    });
  }

  /**
   * Find user by email with password (for login and update pw)
   * @param email User email
   * @returns User entity with password or null
   */
  async findByEmailWithPassword(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
      select: [
        'id',
        'email',
        'nickname',
        'password', // include password for login and update pw
        'role',
        'isActive',
      ],
    });
  }

  /**
   * Find user by ID with followers (ONLY active users)
   * @param id User ID
   * @returns User entity with followers or null
   */
  async findByIdWithFollowers(id: number): Promise<User | null> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.followers', 'follow')
      .leftJoinAndSelect('follow.follower', 'followerUser')
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL AND user.isActive = true')
      .andWhere(
        'followerUser.deletedAt IS NULL AND followerUser.isActive = true',
      )
      .getOne();

    return user;
  }

  /**
   * Find user by ID with followings (ONLY active users)
   * @param id User ID
   * @returns User entity with followings or null
   */
  async findByIdWithFollowings(id: number): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.followings', 'follow')
      .leftJoinAndSelect('follow.following', 'followingUser')
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL AND user.isActive = true')
      .andWhere(
        'followingUser.deletedAt IS NULL AND followingUser.isActive = true',
      )
      .getOne();
  }

  /**
   * Find user by ID with blocked users (ONLY active users)
   * @param id User ID
   * @returns User entity with blocked users or null
   */
  async findByIdWithBlocked(id: number): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.blockers', 'userBlock')
      .leftJoinAndSelect('userBlock.blocker', 'blockingUser')
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL AND user.isActive = true')
      .andWhere(
        'blockingUser.deletedAt IS NULL AND blockingUser.isActive = true',
      )
      .getOne();
  }

  /**
   * Find user by ID with details (teams, followers, followings)
   * @param id User ID
   * @returns User entity with all details or null
   */
  async findByIdWithDetails(id: number): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.teamMembers',
        'teamMember',
        'teamMember.status = :joinedStatus',
        { joinedStatus: 'JOINED' },
      )
      .leftJoinAndSelect('teamMember.team', 'team', 'team.deletedAt IS NULL')
      .leftJoinAndSelect('user.followers', 'followerRel')
      .leftJoinAndSelect(
        'followerRel.follower',
        'followerUser',
        'followerUser.deletedAt IS NULL AND followerUser.isActive = true',
      )
      .leftJoinAndSelect('user.followings', 'followingRel')
      .leftJoinAndSelect(
        'followingRel.following',
        'followingUser',
        'followingUser.deletedAt IS NULL AND followingUser.isActive = true',
      )
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL AND user.isActive = true')
      .getOne();
  }

  async findByNicknameWithDetails(nickname: string): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect(
        'user.teamMembers',
        'teamMember',
        'teamMember.status = :joinedStatus',
        { joinedStatus: 'JOINED' },
      )
      .leftJoinAndSelect('teamMember.team', 'team', 'team.deletedAt IS NULL')
      .leftJoinAndSelect('user.followers', 'followerRel')
      .leftJoinAndSelect(
        'followerRel.follower',
        'followerUser',
        'followerUser.deletedAt IS NULL AND followerUser.isActive = true',
      )
      .leftJoinAndSelect('user.followings', 'followingRel')
      .leftJoinAndSelect(
        'followingRel.following',
        'followingUser',
        'followingUser.deletedAt IS NULL AND followingUser.isActive = true',
      )
      .where('user.nickname = :nickname', { nickname })
      .andWhere('user.deletedAt IS NULL AND user.isActive = true')
      .getOne();
  }

  // ===== Update and Delete =====
  /**
   * Update user information
   * @param id
   * @param updateUserDto
   * @returns
   */
  async updateUser(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User | null> {
    await this.userRepository.update(id, updateUserDto);
    return await this.findById(id);
  }

  /** Update user Password */
  async updatePasswordById(
    id: number,
    hashedNewPassword: string,
  ): Promise<User | null> {
    await this.userRepository.update(id, {
      password: hashedNewPassword,
    });
    return await this.findByIdIncludingInactive(id);
  }

  /** Permanently delete user */
  async hardDeleteById(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /** Restore deleted user */
  async restoreById(id: number): Promise<boolean> {
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
  async userExistsById(id: number): Promise<boolean> {
    const count = await this.userRepository.count({
      where: { id, deletedAt: IsNull() },
    });
    return count > 0;
  }

  /** Count active users */
  async countUsers(): Promise<number> {
    return await this.userRepository.count({
      where: { deletedAt: IsNull() },
    });
  }
}
