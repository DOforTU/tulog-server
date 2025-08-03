import { Injectable } from '@nestjs/common';
import { TeammemberRepository } from './teamember.repository';
import { Teammember } from './teammember.entity';

@Injectable()
export class TeammemberService {
  constructor(private readonly teamemberRepository: TeammemberRepository) {}

  async countTeamsByLeaderId(leaderId: number): Promise<number> {
    return await this.teamemberRepository.countTeamsByLeaderId(leaderId);
  }

  async addTeamMember(
    userId: number,
    teamId: number,
    role: 'leader',
  ): Promise<Teammember> {
    // 1. 이미 존재하는 팀멤버인지 확인 (중복 방지)
    const existing = await this.teamemberRepository.findByTeamMember(
      userId,
      teamId,
    );

    if (existing) {
      throw new Error('이미 팀 멤버로 등록되어 있습니다.');
    }

    // 2. 새 TeamMember 엔티티 생성
    return await this.teamemberRepository.addTeamMember(userId, teamId, role);
  }
}
