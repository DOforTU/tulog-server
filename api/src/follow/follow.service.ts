import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { FollowRepository } from './follow.repository';
import { Follow } from './follow.entity';

@Injectable()
export class FollowService {
  constructor(
    private readonly userService: UserService,
    private readonly followRepository: FollowRepository,
  ) {}

  /** Follow a user
   * followerId follows followId
   */
  async followUser(followerId: number, followId: number): Promise<Follow> {
    // you cannot follow yourself
    if (followerId === followId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // check if the follow exists
    await this.userService.getUserById(followId);

    // check if the duplicate follow exists
    const isFollowing = await this.followRepository.isFollowing(
      followerId,
      followId,
    );

    if (isFollowing) {
      throw new ConflictException('You are already following this user');
    }

    return await this.followRepository.followUser(followerId, followId);
  }

  /** Unfollow a user
   * followerId unfollows followId
   */
  async unfollowUser(followerId: number, followId: number): Promise<boolean> {
    // you cannot unfollow yourself
    if (followerId === followId) {
      throw new BadRequestException('You cannot unfollow yourself');
    }

    // check if the follow exists
    await this.userService.getUserById(followId);

    // check if the follow exists
    const isFollowing = await this.followRepository.isFollowing(
      followerId,
      followId,
    );

    if (!isFollowing) {
      throw new ConflictException('You are not following this user');
    }

    return await this.followRepository.unfollowUser(followerId, followId);
  }
}
