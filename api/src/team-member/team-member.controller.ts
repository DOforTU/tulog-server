import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { TeamWithStatus } from './team-member.dto';
import { SmartAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';
import { TeamMember } from './team-member.entity';

@Controller('teams')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  @Get('get/from')
  async getTeamsByMemberId(
    @Query('userId') userId: string,
    @Query('status') status?: string,
  ): Promise<TeamWithStatus[]> {
    const id = parseInt(userId, 10);
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

  @Delete(':id/leave')
  @UseGuards(SmartAuthGuard)
  async leaveTeam(
    @Param('id') id: number,
    @Request() req: { user: User },
  ): Promise<boolean> {
    return await this.teamMemberService.leaveTeam(id, req.user.id);
  }

  @Post(':id/join')
  @UseGuards(SmartAuthGuard)
  async joinTeam(
    @Param('id') id: number,
    @Request() req: { user: User },
  ): Promise<TeamMember> {
    return await this.teamMemberService.joinTeam(req.user.id, id);
  }
}
