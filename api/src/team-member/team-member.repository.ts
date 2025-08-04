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

  async findByMemeberId(memberId: number): Promise<TeamMember[] | null> {
    return await this.teamMemberRepository.find({ where: { memberId } });
  }
}
