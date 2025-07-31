import {
  Controller,
  Delete,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FollowService } from './follow.service';
import { User } from 'src/user/user.entity';
import { Follow } from './follow.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('users/:id')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @Post('follow')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<Follow> {
    return await this.followService.followUser(req.user.id, id);
  }

  @Delete('unfollow')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<boolean> {
    return await this.followService.unfollowUser(req.user.id, id);
  }
}
