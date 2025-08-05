import { Injectable } from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { Team } from './team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateTeamInfoDto } from './team.dto';

@Injectable()
export class TeamRepository {
  constructor(
    @InjectRepository(Team)
    private readonly teamRepository: Repository<Team>,
  ) {}

  async findByName(name: string): Promise<Team | null> {
    return await this.teamRepository.findOne({
      where: { name, deletedAt: IsNull() },
    });
  }

  async findById(teamId: number): Promise<Team | null> {
    return await this.teamRepository.findOne({
      where: { id: teamId, deletedAt: IsNull() },
    });
  }

  async findTeamWithMembersById(id: number): Promise<Team | null> {
    return await this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.teamMembers', 'teamMember')
      .leftJoinAndSelect('teamMember.user', 'user')
      .where('team.id = :id', { id })
      .andWhere('team.deletedAt IS NULL')
      .getOne();
  }

  async findTeamWithMembersByName(name: string): Promise<Team | null> {
    return await this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.teamMembers', 'teamMember')
      .leftJoinAndSelect('teamMember.user', 'user')
      .where('team.name = :name', { name })
      .andWhere('team.deletedAt IS NULL')
      .getOne();
  }

  async updateTeam(
    teamId: number,
    updateTeamInfoDto: UpdateTeamInfoDto,
  ): Promise<Team | null> {
    await this.teamRepository.update(teamId, updateTeamInfoDto);
    return await this.findById(teamId);
  }
}
