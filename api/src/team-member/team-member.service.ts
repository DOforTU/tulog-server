import { UserService } from 'src/user/user.service';
import { TeamWithStatus } from './team-member.dto';
import { TeamMemberRepository } from './team-member.repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TeamMember, TeamMemberStatus } from './team-member.entity';

@Injectable()
export class TeamMemberService {
  constructor(
    private readonly teamMemberRepository: TeamMemberRepository,
    private readonly userService: UserService,
  ) {}

  /**
   * 유저가 속한 팀이 몇개있는지 확인
   * join인 팀만 추출
   * 레파지토리에서는 팀 인스턴스를 모두 가져와서 판별
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
   * 팀원이 1명만 있을 경우, 팀이 자동 삭제
   * 팀장이 나가면 다른 팀원에게 리더 위임이 선행되어야함
   *
   * 먼저 예외 생각하지 않고 팀에서 팀맴버가 삭제되는것만 생각 (팀을 나가는거니까)
   *
   * teamid로 TeamMember[]를 가져옴 -> TeamMber[]의 count가 1일 때 leaveTeam + Team softDelete
   * count가 1보다 크면서, 나가는 사람이 리더일 경우
   * throw new exception (`리더 선임을 먼저 하세요`)
   * count가 1보다 크면서, 나가는 사람이 리더가 아닐 경우
   * leaveTeam만 함
   */
  async leaveTeam(teamId: number, memberId: number): Promise<boolean> {
    await this.teamMemberRepository.leaveTeam(teamId, memberId);
    return true;
  }
}
