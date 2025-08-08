import { UserService } from 'src/user/user.service';
import { TeamWithStatus } from './team-member.dto';
import { TeamMemberRepository } from './team-member.repository';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TeamMember, TeamMemberStatus } from './team-member.entity';
import { Team } from 'src/team/team.entity';

@Injectable()
export class TeamMemberService {
  constructor(
    private readonly teamMemberRepository: TeamMemberRepository,
    private readonly userService: UserService,
  ) {}

  /**
   * get the number of teams a user is part of
   * @param memberId Member ID: the ID of the user whose team count is to be fetched
   * @returns The number of teams the user is part of
   */
  async countTeamsByMemberId(memberId: number): Promise<number> {
    const teamMembers =
      await this.teamMemberRepository.findByMemberId(memberId);

    if (!teamMembers) return 0;

    const filteredTeams = teamMembers.filter(
      (teamMember) => teamMember.status === TeamMemberStatus.JOINED,
    );
    return filteredTeams.length;
  }

  /**
   * get all teams that a user is part of
   * @param memberId Member ID: the ID of the user whose teams are to be fetched
   * @returns An array of TeamWithStatus objects representing the teams
   */
  async getJoinedTeamsByMemberId(memberId: number): Promise<TeamWithStatus[]> {
    // check if user exists
    await this.userService.getUserById(memberId);

    const teamMembers =
      await this.teamMemberRepository.findWithTeamsByMemberId(memberId);

    // If no teams found, throw an exception
    if (!teamMembers || teamMembers.length === 0) {
      throw new NotFoundException(`${memberId} does not have any teams`);
    }

    return teamMembers
      .filter((tm) => tm.status === TeamMemberStatus.JOINED)
      .map((tm) => ({
        team: tm.team,
        status: TeamMemberStatus.JOINED,
        isLeader: tm.isLeader,
      }));
  }

  /**
   * get all teams that a user is invited to
   * @param memberId Member ID: the ID of the user whose invited teams are to be fetched
   * @returns An array of TeamWithStatus objects representing the teams
   */
  async getInvitedTeamsByMemberId(memberId: number): Promise<TeamWithStatus[]> {
    // check if user exists
    await this.userService.getUserById(memberId);

    const teamMembers =
      await this.teamMemberRepository.findWithTeamsByMemberId(memberId);

    // If no teams found, throw an exception
    if (!teamMembers || teamMembers.length === 0) {
      throw new NotFoundException(`${memberId} does not have any teams`);
    }

    return teamMembers
      .filter((tm) => tm.status === TeamMemberStatus.INVITED)
      .map((tm) => ({
        team: tm.team,
        status: TeamMemberStatus.INVITED,
        isLeader: tm.isLeader,
      }));
  }

  /**
   * get all teams that a user is pending to join
   * @param memberId Member ID: the ID of the user whose pending teams are to be fetched
   * @returns An array of TeamWithStatus objects representing the teams
   */
  async getPendingTeamsByMemberId(memberId: number): Promise<TeamWithStatus[]> {
    // check if user exists
    await this.userService.getUserById(memberId);

    const teamMembers =
      await this.teamMemberRepository.findWithTeamsByMemberId(memberId);

    // If no teams found, throw an exception
    if (!teamMembers || teamMembers.length === 0) {
      throw new NotFoundException(`${memberId} does not have any teams`);
    }

    return teamMembers
      .filter((tm) => tm.status === TeamMemberStatus.PENDING)
      .map((tm) => ({
        team: tm.team,
        status: TeamMemberStatus.PENDING,
        isLeader: tm.isLeader,
      }));
  }

  /**
   * get all teams that a user is part of
   * @param memberId Member ID: the ID of the user whose teams are to be fetched
   * @returns An array of TeamWithStatus objects representing the teams
   */
  async getAllTeamsByMemberId(memberId: number): Promise<TeamWithStatus[]> {
    // check if user exists
    await this.userService.getUserById(memberId);

    const teamMembers =
      await this.teamMemberRepository.findWithTeamsByMemberId(memberId);

    // If no teams found, throw an exception
    if (!teamMembers || teamMembers.length === 0) {
      throw new NotFoundException(`${memberId} does not have any teams`);
    }

    return teamMembers.map((tm) => ({
      team: tm.team,
      status: tm.status,
      isLeader: tm.isLeader,
    }));
  }

  /**
   * Invite a team
   * 팀장인지 확인하기
   * 초대하려는 사용자가 존재하는지
   * 이미 팀에 존재하는 사용자인지
   */
  async inviteTeam(
    leaderId: number,
    teamId: number,
    userId: number,
  ): Promise<boolean> {
    const leader = await this.getTeamMemberByPrimaryKey(leaderId, teamId);
    if (!leader.isLeader) {
      throw new ConflictException('You are not authorized to invite members.');
    }

    // Check if the user exists
    await this.getTeamMemberByPrimaryKey(userId, teamId);

    // Proceed to invite the user from the team
    return await this.teamMemberRepository.inviteTeam(teamId, userId);
  }

  /**
   * Join a team
   * @param memberId Member ID: the ID of the user who wants to join the team
   * @param teamId Team ID: the ID of the team to join
   * @returns The created TeamMember entity
   */
  async joinTeam(memberId: number, teamId: number): Promise<TeamMember> {
    const teamMember = await this.findTeamMemberByPrimaryKey(memberId, teamId);
    if (teamMember) {
      throw new ConflictException('You are already a member of this team.');
    }
    return await this.teamMemberRepository.joinTeam(memberId, teamId);
  }

  /**
   * find a team member by primary key
   * @param memberId
   * @param teamId
   * @returns The found TeamMember entity or null if not found
   */
  async findTeamMemberByPrimaryKey(
    memberId: number,
    teamId: number,
  ): Promise<TeamMember | null> {
    return await this.teamMemberRepository.findOneByPrimaryKey(
      memberId,
      teamId,
    );
  }

  /**
   * Leave a team
   * @param teamId Team ID: the ID of the team to leave
   * @param memberId Member ID: the ID of the user who wants to leave the team
   * @returns A boolean indicating whether the leave operation was successful
   */
  async leaveTeam(teamId: number, memberId: number): Promise<boolean> {
    const teamMembers =
      await this.teamMemberRepository.findWithTeamsByTeamId(teamId);

    // 팀이 존재하지 않거나 멤버가 없는 경우
    if (!teamMembers || teamMembers.length === 0) {
      throw new NotFoundException('팀을 찾을 수 없습니다.');
    }
    // 탈퇴하려는 멤버가 팀에 있는지 확인
    const leavingMember = teamMembers.find((m) => m.memberId === memberId);
    if (!leavingMember) {
      throw new NotFoundException('해당 멤버가 팀에 존재하지 않습니다.');
    }

    // 팀원이 1명뿐인 경우: 팀 삭제
    if (teamMembers.length === 1) {
      // TODO: transaction 처리 필요
      await this.teamMemberRepository.leaveTeam(teamId, memberId);
      await this.teamMemberRepository.softDeleteTeam(teamId);
      return true;
    }

    // 팀원이 여러 명이고 리더가 탈퇴하려는 경우: 리더십 위임 필요
    if (leavingMember.isLeader) {
      throw new ConflictException(
        '팀장은 다른 멤버에게 리더십을 위임한 후 탈퇴할 수 있습니다.',
      );
    }

    // 일반 멤버 탈퇴
    await this.teamMemberRepository.leaveTeam(teamId, memberId);
    return true;
  }

  /**
   * Kick a team member
   * @param requesterId Requester ID: the ID of the user for checking leader status
   * @param teamId Team ID: the ID of the team from which the member will be kicked
   * @param userId User ID: the ID of the user to be kicked from the team
   * @return A boolean indicating whether the kick operation was successful
   */
  async kickTeamMember(
    leaderId: number,
    teamId: number,
    userId: number,
  ): Promise<boolean> {
    // Check if the requester is a leader of the team
    const leader = await this.getTeamMemberByPrimaryKey(leaderId, teamId);
    if (!leader.isLeader) {
      throw new ConflictException('You are not authorized to kick members.');
    }

    // Check if the user to be kicked is part of the team
    await this.getTeamMemberByPrimaryKey(userId, teamId);

    // Proceed to kick the user from the team
    return await this.teamMemberRepository.leaveTeam(teamId, userId);
  }

  async getTeamMemberByPrimaryKey(
    memberId: number,
    teamId: number,
  ): Promise<TeamMember> {
    const teamMember = await this.teamMemberRepository.findOneByPrimaryKey(
      memberId,
      teamId,
    );

    if (!teamMember) {
      throw new NotFoundException(
        `Team member with memberId ${memberId} and teamId ${teamId} not found.`,
      );
    }
    return teamMember;
  }
}
