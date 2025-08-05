import { UserService } from 'src/user/user.service';
import { TeamWithStatus } from './team-member.dto';
import { TeamMemberRepository } from './team-member.repository';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
   * 팀 탈퇴 로직
   * 1. 팀원이 1명뿐이면 팀을 삭제
   * 2. 리더가 탈퇴하려면 다른 멤버에게 리더십 위임 필요
   * 3. 일반 멤버는 자유롭게 탈퇴 가능
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
}
