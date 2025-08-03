import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { FollowRepository } from './follow.repository';
import { Follow } from './follow.entity';
import { User } from 'src/user/user.entity';

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

  /** Get followers of a user */
  async getFollowers(userId: number): Promise<User[]> {
    // check if the user exists
    await this.userService.getUserById(userId);

    // user will be null, when no followers exist
    const user = await this.userService.findByIdWithFollowers(userId);
    if (!user) {
      // so return []
      return [];
    }

    return user.followers.map((f) => f.follower);
  }

  /** Get followings of a user */
  async getFollowings(userId: number): Promise<User[]> {
    // check if the user exists
    await this.userService.getUserById(userId);

    // user will be null, when no followings exist
    const user = await this.userService.findByIdWithFollowings(userId);
    if (!user) {
      // so return []
      return [];
    }

    return user.followings.map((f) => f.following);
  }
}
