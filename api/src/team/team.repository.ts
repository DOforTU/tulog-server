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

  // ===== UPDATE =====

  async updateTeam(
    teamId: number,
    updateTeamInfoDto: UpdateTeamInfoDto,
  ): Promise<Team | null> {
    await this.teamRepository.update(teamId, updateTeamInfoDto);
    return await this.findById(teamId);
  }

  // ===== SUB FUNCTION =====

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
      .andWhere(
        '(teamMember.status = :joinedStatus OR teamMember.status IS NULL)',
        {
          joinedStatus: 'JOINED',
        },
      )
      .andWhere(
        '(user.deletedAt IS NULL AND user.isActive = true OR user.id IS NULL)',
      )
      .getOne();
  }

  async findTeamWithMembersByName(name: string): Promise<Team | null> {
    return await this.teamRepository
      .createQueryBuilder('team')
      .leftJoinAndSelect('team.teamMembers', 'teamMember')
      .leftJoinAndSelect('teamMember.user', 'user')
      .where('team.name = :name', { name })
      .andWhere('team.deletedAt IS NULL')
      .andWhere(
        '(teamMember.status = :joinedStatus OR teamMember.status IS NULL)',
        {
          joinedStatus: 'JOINED',
        },
      )
      .andWhere(
        '(user.deletedAt IS NULL AND user.isActive = true OR user.id IS NULL)',
      )
      .getOne();
  }

  async findFollowingUserById(teamId: number): Promise<Team | null> {
    return await this.teamRepository
      .createQueryBuilder('team')
      .leftJoin('team.teamFollows', 'teamFollow') // Team → TeamFollow 조인
      .leftJoinAndSelect('teamFollow.user', 'user')
      .where('team.id = :teamId', { teamId })
      .getOne();
  }
}
