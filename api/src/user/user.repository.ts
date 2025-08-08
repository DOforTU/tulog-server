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

  /**
   * Update user information
   * @param id
   * @param updateUserDto
   * @returns
   */
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
    return await this.findIncludingNoActiveById(id);
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

  /** Find active user by email (can get no isActive user)*/
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  /** Find active user by sub (used in JWT validation) */
  async findBySub(sub: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: sub, deletedAt: IsNull() },
    });
  }

  /** Find active user by email with password (for login and update pw, only id, email, password, nickname, role, isActive) */
  async findWithPasswordByEmail(email: string): Promise<User | null> {
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

  /** Find active user include no-active by name (ONLY not-deleted) */
  async findByName(name: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { name, deletedAt: IsNull() },
    });
  }

  /** Find active user include no-active by nickname (ONLY not-deleted & isActive) */
  async findByNickname(nickname: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { nickname, deletedAt: IsNull(), isActive: true },
    });
  }

  async findIncludingNoActiveById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
  }

  async findIncludingNoActiveByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  async findIncludingNoActiveByNickname(
    nickname: string,
  ): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { nickname, deletedAt: IsNull() },
    });
  }

  /** Find user by email (including deleted users) */
  async findIncludingDeletedByEmail(email: string): Promise<User | null> {
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

  /** Find User with password include no-active user */
  async findByIdWithPassword(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
      select: ['id', 'email', 'password'],
    });
  }

  /** Find User with Followers */
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

  /** Find user with Followings */
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

  /** Find user with Blocked  */
  async findWithBlockedById(id: number): Promise<User | null> {
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

  /** Find user with all details for UserDetails DTO */
  async findUserDetailsById(id: number): Promise<User | null> {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.teamMembers', 'teamMember')
      .leftJoinAndSelect('teamMember.team', 'team')
      .leftJoinAndSelect('user.followers', 'followerRel')
      .leftJoinAndSelect('followerRel.follower', 'followerUser')
      .leftJoinAndSelect('user.followings', 'followingRel')
      .leftJoinAndSelect('followingRel.following', 'followingUser')
      .where('user.id = :id', { id })
      .andWhere('user.deletedAt IS NULL AND user.isActive = true')
      //  andWhere conditions to ensure no deleted or inactive teams, followers, and followings
      .andWhere('(team.deletedAt IS NULL OR team.id IS NULL)')
      .andWhere(
        '(teamMember.status = :joinedStatus OR teamMember.status IS NULL)',
        {
          joinedStatus: 'JOINED',
        },
      )
      .andWhere(
        '(followerUser.deletedAt IS NULL AND followerUser.isActive = true OR followerUser.id IS NULL)',
      )
      .andWhere(
        '(followingUser.deletedAt IS NULL AND followingUser.isActive = true OR followingUser.id IS NULL)',
      )
      .getOne();
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
