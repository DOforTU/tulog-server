import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Teammember } from './teammember.entity';
import { Team } from 'src/team/team.entity';

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
    role: 'leader' | 'member',
  ): Promise<Teammember[]> {
    const addTeamMember = await this.teamemberRepository.findOne({
      where: { userId, teamId },
    });
    return await this.teamemberRepository.save(addTeamMember);
  }
}
