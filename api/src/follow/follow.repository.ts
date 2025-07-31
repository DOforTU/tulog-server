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

  /** check if the duplicate follow exists */
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const isFollowing = await this.followRepository.findOne({
      where: { followerId, followingId },
    });
    return isFollowing !== null;
  }

  /** Follow a user */
  async followUser(followerId: number, followingId: number): Promise<Follow> {
    const follow = this.followRepository.create({ followerId, followingId });
    return await this.followRepository.save(follow);
  }
}
