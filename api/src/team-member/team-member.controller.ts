import { Controller, Get, Param, Query } from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { TeamWithStatus } from './team-member.dto';

@Controller('users')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Get(':id/teams')
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
}
