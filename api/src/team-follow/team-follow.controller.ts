import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TeamFollowService } from './team-follow.service';
import { SmartAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';
import { Team } from 'src/team/team.entity';
import { TeamFollow } from './team-follow.entity';
import { PublicUser } from 'src/user/user.dto';
import { toPublicUsers } from 'src/common/helper/to-public-user';

@Controller('follow/team')
export class TeamFollwController {
  constructor(private readonly teamFollowService: TeamFollowService) {}

  // ===== CREATE =====

  /** Post user follows a team  */
  @Post(':id/follow')
  @UseGuards(SmartAuthGuard)
  async followTeam(
    @Request() req: { user: User },
    @Param('id') teamId: number,
  ): Promise<TeamFollow> {
    return await this.teamFollowService.followTeam(
      req.user.id,
      req.user.nickname,
      teamId,
    );
  }

  // ===== READ =====

  /** Get my followed teams */
  @Get('me')
  @UseGuards(SmartAuthGuard)
  async getMyFollowingTeams(@Request() req: { user: User }): Promise<Team[]> {
    return await this.teamFollowService.getMyFollowingTeams(req.user.id);
  }

  /** Get users who follow team */
  @Get(':id/followers')
  async getFollowers(@Param('id') id: number): Promise<PublicUser[] | null> {
    return toPublicUsers(await this.teamFollowService.getFollowersWithTeam(id));
  }

  // ===== DELETE =====

  @Delete(':id/unfollow')
  @UseGuards(SmartAuthGuard)
  async unfollowTeam(
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<boolean> {
    return await this.teamFollowService.unfollowTeam(req.user.id, id);
  }
}
