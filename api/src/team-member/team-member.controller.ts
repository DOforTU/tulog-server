import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { TeamWithStatus } from './team-member.dto';
import { SmartAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';

@Controller()
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Get('users/:id/teams')
  async getTeamsByMemberId(
    @Param('id') id: number,
    @Query('status') status?: string,
  ): Promise<TeamWithStatus[]> {
    switch (status) {
      case 'joined':
        return await this.teamMemberService.getJoinedTeamsByMemberId(id);
      case 'invited':
        return await this.teamMemberService.getInvitedTeamsByMemberId(id);
      case 'pending':
        return await this.teamMemberService.getPendingTeamsByMemberId(id);
      default:
        return await this.teamMemberService.getAllTeamsByMemberId(id);
    }
  }

  @Delete('teams/:id/leave')
  @UseGuards(SmartAuthGuard)
  async leaveTeam(
    @Param('id') id: number,
    @Request() req: { user: User },
  ): Promise<boolean> {
    return await this.teamMemberService.leaveTeam(id, req.user.id);
  }
}
