import {
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { JwtAuthGuard, SmartAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';
import { TeamMember } from './team-member.entity';

@Controller('teams/:teamId')
export class TeamMemberController {
  constructor(private readonly teamMemberService: TeamMemberService) {}

  // ===== CREATE =====
  /**
   * Invite a team member
   * @param req Request object containing user information
   * @param teamId Team ID: the ID of the team to invite the member to
   * @param memberId Member ID: the ID of the member to invite
   * @returns The created TeamMember entity
   */
  @Post('members/:memberId/invite')
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
   * Accept team invitation from notification
   * @param req Request object containing user information
   * @param teamId Team ID
   * @returns Updated TeamMember entity
   */
  @Post('invitation/accept')
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
   * Join a team
   * @param id Team ID: the ID is that you want to join
   * @param req Request object containing user information
   * @returns The created TeamMember entity
   */
  @Post('join')
  @UseGuards(SmartAuthGuard)
  async requestToTeam(
    @Param('teamId') id: number,
    @Request() req: { user: User },
  ): Promise<TeamMember> {
    return await this.teamMemberService.requestToTeam(id, req.user.id);
  }

  /**
   * Accept team join request from notification (team leader only)
   * @param req Request object containing user information
   * @param teamId Team ID
   * @param memberId Member ID who requested to join
   * @returns Updated TeamMember entity
   */
  @Patch('join-request/members/:memberId/accept')
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
   * 팀장 권한 위임
   * 팀장인지 확인하고
   * 해당 팀에 있는 팀원에게 팀장 권한을 넘겨줌
   * 그리고 그 팀장은 일반 팀원으로 변경
   * 팀장이 변경되었다고 알림을 (팀 전체에게 공지 혹은 변경된 팀장에게만)
   *
   */
  @Patch(':leaderId/:memberId/delegation')
  @UseGuards(JwtAuthGuard)
  async delegateLeader(
    @Param('leaderId') laederid: number,
    @Param('memberId') memberId: number,
  ): Promise<boolean> {
    return await this.teamMemberService.delegateLeader(laederid, memberId);
  }

  // ===== DELETE =====
  /**
   * Reject team invitation from notification
   * @param req Request object containing user information
   * @param teamId Team ID
   * @returns Success status
   */
  @Delete('invitation/reject')
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
   * Reject team join request from notification (team leader only)
   * @param req Request object containing user information
   * @param teamId Team ID
   * @param memberId Member ID who requested to join
   * @returns Success status
   */
  @Delete('join-request/members/:memberId/reject')
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

  /**
   * leave a team
   * @param req Request object containing user information
   * @param id Team ID: the ID of the team to leave
   * @returns A boolean indicating whether the leave operation was successful
   */
  @Delete('leave')
  @UseGuards(SmartAuthGuard)
  async leaveTeam(
    @Request() req: { user: User },
    @Param('teamId') teamId: number,
  ): Promise<boolean> {
    return await this.teamMemberService.leaveTeam(teamId, req.user.id);
  }

  /**
   * Kick a team member
   * @param req Request object containing user information
   * @param id Team ID: the ID of the team from which to kick the member
   * @param userId User ID: the ID of the user to be kicked
   * @returns A boolean indicating whether the kick operation was successful
   */
  @Delete('members/:memberId/kick')
  @UseGuards(SmartAuthGuard)
  async kickTeamMember(
    @Request() req: { user: User },
    @Param('teamId') teamId: number,
    @Param('userId') userId: number,
  ): Promise<boolean> {
    return await this.teamMemberService.kickTeamMember(
      req.user.id,
      teamId,
      userId,
    );
  }
}
