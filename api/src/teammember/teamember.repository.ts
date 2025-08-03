import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Teammember, TeamRole } from './teammember.entity';

@Injectable()
export class TeammemberRepository {
  constructor(
    @InjectRepository(Teammember)
    private readonly teamemberRepository: Repository<Teammember>,
  ) {}

  /** check if the duplicate follow exists */
  async addTeamMember(
    userId: number,
    teamId: number,
    role: string,
  ): Promise<Teammember> {
    const addTeamMember = await this.teamemberRepository.findOne({
      where: { userId, teamId },
    });
    // 3. 새 멤버 엔티티 생성
    const newMember = this.teamemberRepository.create({
      userId: userId,
      teamId: teamId,
      role: TeamRole.Leader,
    });

    // 4. 저장 후 반환
    return await this.teamemberRepository.save(newMember);
  }

  async findByTeamMember(
    userId: number,
    teamId: number,
  ): Promise<Teammember | null> {
    return await this.teamemberRepository.findOne({
      where: { userId, teamId },
    });
  }

  async countTeamsByLeaderId(leaderId: number) {
    return await this.teamemberRepository.count({
      where: { userId: leaderId, role: TeamRole.Leader },
    });
  }
}
