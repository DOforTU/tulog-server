import {
  Controller,
  Delete,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { SmartAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';
import { TeamMember } from './team-member.entity';

@Controller('teams/:teamId/members')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  /**
   * Invite a team member
   * @param req Request object containing user information
   * @param teamId Team ID: the ID of the team to invite the member to
   * @param memberId Member ID: the ID of the member to invite
   * @returns The created TeamMember entity
   */
  @Post(':memberId/invite')
  @UseGuards(SmartAuthGuard)
  async inviteToTeam(
    @Request() req: { user: User },
    @Param('teamId') teamId: number,
    @Param('memberId') memberId: number,
  ): Promise<TeamMember> {
    return await this.teamMemberService.inviteToTeam(
      req.user.id, // Leader ID
      teamId,
      memberId,
    );
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
  async requestToTeam(
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<TeamMember> {
    return await this.teamMemberService.requestToTeam(req.user.id, id);
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

  /**
   * Accept team invitation from notification
   * @param req Request object containing user information
   * @param teamId Team ID
   * @returns Updated TeamMember entity
   */
  @Post(':teamId/invitation/accept')
  @UseGuards(SmartAuthGuard)
  async acceptTeamInvitation(
    @Request() req: { user: User },
    @Param('teamId') teamId: number,
  ): Promise<TeamMember> {
    return await this.teamMemberService.acceptTeamInvitation(
      teamId,
      req.user.id,
    );
  }

  /**
   * Reject team invitation from notification
   * @param req Request object containing user information
   * @param teamId Team ID
   * @returns Success status
   */
  @Delete(':teamId/invitation/reject')
  @UseGuards(SmartAuthGuard)
  async rejectTeamInvitation(
    @Request() req: { user: User },
    @Param('teamId') teamId: number,
  ): Promise<boolean> {
    return await this.teamMemberService.rejectTeamInvitation(
      teamId,
      req.user.id,
    );
  }

  /**
   * Accept team join request from notification (team leader only)
   * @param req Request object containing user information
   * @param teamId Team ID
   * @param memberId Member ID who requested to join
   * @returns Updated TeamMember entity
   */
  @Post(':teamId/join-request/:memberId/accept')
  @UseGuards(SmartAuthGuard)
  async acceptTeamJoinRequest(
    @Request() req: { user: User },
    @Param('teamId') teamId: number,
    @Param('memberId') memberId: number,
  ): Promise<TeamMember> {
    return await this.teamMemberService.acceptTeamJoinRequest(
      teamId,
      memberId,
      req.user.id, // Leader ID
    );
  }

  /**
   * Reject team join request from notification (team leader only)
   * @param req Request object containing user information
   * @param teamId Team ID
   * @param memberId Member ID who requested to join
   * @returns Success status
   */
  @Delete(':teamId/join-request/:memberId/reject')
  @UseGuards(SmartAuthGuard)
  async rejectTeamJoinRequest(
    @Request() req: { user: User },
    @Param('teamId') teamId: number,
    @Param('memberId') memberId: number,
  ): Promise<boolean> {
    return await this.teamMemberService.rejectTeamJoinRequest(
      teamId,
      memberId,
      req.user.id, // Leader ID
    );
  }
}
