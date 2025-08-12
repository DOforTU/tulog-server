import { Injectable } from '@nestjs/common';
import { Follow } from './follow.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class FollowRepository {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
  ) {}

  // ===== CREATE =====

  /** Follow a user */
  async followUser(followerId: number, followingId: number): Promise<Follow> {
    const follow = this.followRepository.create({ followerId, followingId });
    return await this.followRepository.save(follow);
  }

  // ===== DELETE =====

  /** Unfollow a user */
  async unfollowUser(
    followerId: number,
    followingId: number,
  ): Promise<boolean> {
    await this.followRepository.delete({ followerId, followingId });
    return true;
  }

  // ===== SUB FUNCTIONS =====

  /** check if the duplicate follow exists */
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const follow = await this.followRepository
      .createQueryBuilder('follow')
      .where('follow.followerId = :followerId', { followerId })
      .andWhere('follow.followingId = :followingId', { followingId })
      .getOne();
    return follow !== null;
  }
}
