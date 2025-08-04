import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamMember } from './team-member.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TeamMemberRepository {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
  ) {}

  async findByMemberId(memberId: number): Promise<TeamMember[] | null> {
    return await this.teamMemberRepository.find({ where: { memberId } });
  }

  async findTeamsByMemberId(memberId: number): Promise<TeamMember[] | null> {
    return await this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .leftJoinAndSelect('teamMember.team', 'team')
      .where('teamMember.memberId = :memberId', { memberId })
      .getMany();
  }

  async leaveTeam(teamId: number, memberId: number): Promise<boolean> {
    await this.teamMemberRepository.delete({ teamId, memberId });
    return true;
  }
}
