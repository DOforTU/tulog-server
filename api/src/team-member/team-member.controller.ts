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

  /**
   * get all teams that a user is part of
   * @param userId User ID: the ID of the user whose teams are to be fetched
   * @param status Status: optional filter for team status (joined, invited, pending)
   * @returns An array of TeamWithStatus objects representing the teams
   */
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

  /**
   * Invite a team
   *
   */
  @Post(':id/invite')
  @UseGuards(SmartAuthGuard)
  async inviteTeam(
    @Request() req: { user: User },
    @Param('id') id: number,
    @Query('userId') userId: number, //이거 왜 사용하는거지?
  ): Promise<boolean> {
    return await this.teamMemberService.inviteTeam(req.user.id, id, userId);
  }

  /**
   * leave a team
   * @param req Request object containing user information
   * @param id Team ID: the ID of the team to leave
   * @returns A boolean indicating whether the leave operation was successful
   */
  @Delete(':id/leave')
  @UseGuards(SmartAuthGuard)
  async leaveTeam(
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<boolean> {
    return await this.teamMemberService.leaveTeam(id, req.user.id);
  }

  /**
   * Join a team
   * @param id Team ID: the ID is that you want to join
   * @param req Request object containing user information
   * @returns The created TeamMember entity
   */
  @Post(':id/join')
  @UseGuards(SmartAuthGuard)
  async joinTeam(
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<TeamMember> {
    return await this.teamMemberService.joinTeam(req.user.id, id);
  }

  /**
   * Kick a team member
   * @param req Request object containing user information
   * @param id Team ID: the ID of the team from which to kick the member
   * @param userId User ID: the ID of the user to be kicked
   * @returns A boolean indicating whether the kick operation was successful
   */
  @Delete(':id/kick')
  @UseGuards(SmartAuthGuard)
  async kickTeamMember(
    @Request() req: { user: User },
    @Param('id') id: number,
    @Query('userId') userId: number,
  ): Promise<boolean> {
    return await this.teamMemberService.kickTeamMember(req.user.id, id, userId);
  }
}
