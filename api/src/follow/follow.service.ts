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

  // followerId follows followId
  async followUser(followerId: number, followId: number): Promise<Follow> {
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

    return this.followRepository.followUser(followerId, followId);
  }
}
