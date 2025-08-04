import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TeamRepository {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async findByTeamName(name: string): Promise<Team | null> {
    return await this.teamRepository.findOne({ where: { name } });
  }
}
