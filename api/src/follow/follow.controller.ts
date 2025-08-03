import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { User } from 'src/user/user.entity';
import { Follow } from './follow.entity';
import { SmartAuthGuard } from 'src/auth/jwt';
import { ResponsePublicUser } from 'src/user/user.dto';
import { toPublicUsers } from 'src/common/helper/to-public-user';

@Controller('users')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  /** Get my followers */
  @Get('me/followers')
  @UseGuards(SmartAuthGuard)
  async getMyFollowers(
    @Request() req: { user: User },
  ): Promise<ResponsePublicUser[]> {
    return toPublicUsers(await this.followService.getFollowers(req.user.id));
  }

  /** Get my followings */
  @Get('me/followings')
  @UseGuards(SmartAuthGuard)
  async getMyFollowings(
    @Request() req: { user: User },
  ): Promise<ResponsePublicUser[]> {
    return toPublicUsers(await this.followService.getFollowings(req.user.id));
  }

  @Post(':id/follow')
  @UseGuards(SmartAuthGuard)
  async followUser(
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<Follow> {
    return await this.followService.followUser(req.user.id, id);
  }

  @Delete(':id/unfollow')
  @UseGuards(SmartAuthGuard)
  async unfollowUser(
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<boolean> {
    return await this.followService.unfollowUser(req.user.id, id);
  }

  /** Get users who follow me */
  @Get(':id/followers')
  async getFollowers(@Param('id') id: number): Promise<User[] | null> {
    return await this.followService.getFollowers(id);
  }

  /** Get users I follow */
  @Get(':id/followings')
  async getFollowings(@Param('id') id: number): Promise<User[] | null> {
    return await this.followService.getFollowings(id);
  }
}
