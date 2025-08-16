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
import { PublicUser } from 'src/user/user.dto';
import { toPublicUsers } from 'src/common/helper/to-public-user';

@Controller('users')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  // ===== CREATE =====

  @Post(':id/follow')
  @UseGuards(SmartAuthGuard)
  async followUser(
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<Follow> {
    return await this.followService.followUser(req.user.id, id);
  }

  // ===== READ =====

  /** Get my followers */
  @Get('me/followers')
  @UseGuards(SmartAuthGuard)
  async getMyFollowers(@Request() req: { user: User }): Promise<PublicUser[]> {
    return toPublicUsers(await this.followService.getFollowers(req.user.id));
  }

  /** Get my followings */
  @Get('me/followings')
  @UseGuards(SmartAuthGuard)
  async getMyFollowings(@Request() req: { user: User }): Promise<PublicUser[]> {
    return toPublicUsers(await this.followService.getFollowings(req.user.id));
  }

  /** Get users who follow me */
  @Get(':id/followers')
  async getFollowers(@Param('id') id: number): Promise<PublicUser[] | null> {
    return toPublicUsers(await this.followService.getFollowers(id));
  }

  /** Get users I follow */
  @Get(':id/followings')
  async getFollowings(@Param('id') id: number): Promise<PublicUser[] | null> {
    return toPublicUsers(await this.followService.getFollowings(id));
  }

  // ===== UPDATE =====

  // ===== DELETE =====

  // 팔로우 취소 같은 경우는 팔로우 테이블에서 팔로우하는 사용자 아이디랑 팔로우 당한 사용자 아이디가 존재하는지 조회
  // 존재하면 이 테일블에서 삭제하면 팔로우는 삭제
  // 팔로우 수도 생각해야해서 숫자도 감소 (연쇄조건)
  @Delete(':id/unfollow')
  @UseGuards(SmartAuthGuard)
  async unfollowUser(
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<boolean> {
    return await this.followService.unfollowUser(req.user.id, id);
  }
}
