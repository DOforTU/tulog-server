import { Injectable } from '@nestjs/common';
import { TeamMemberStatus } from './team-member.entity';
import { TeamMemberRepository } from './team-member.repository';

@Injectable()
export class TeamMemberService {
  constructor(private readonly teamMemberRepository: TeamMemberRepository) {}

  /**
   * 유저가 속한 팀이 몇개있는지 확인
   * join인 팀만 추출
   * 레파지토리에서는 팀 인스턴스를 모두 가져와서 판별
   */
  async countTeamsByMemberId(memberId: number): Promise<number> {
    const teamMembers =
      await this.teamMemberRepository.findByMemeberId(memberId);

    if (!teamMembers) return 0;

    const filteredTeams = teamMembers.filter(
      (teamMember) => teamMember.status === TeamMemberStatus.JOINED,
    );
    return filteredTeams.length;
  }
}
