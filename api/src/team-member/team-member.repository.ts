import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { TeamMember } from './team-member.entity';
import { Team } from 'src/team/team.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TeamMemberRepository {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
    private readonly dataSource: DataSource,
  ) {}

  async findByMemberId(memberId: number): Promise<TeamMember[] | null> {
    return await this.teamMemberRepository.find({ where: { memberId } });
  }

  async findWithTeamsByMemberId(
    memberId: number,
  ): Promise<TeamMember[] | null> {
    return await this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .leftJoinAndSelect('teamMember.team', 'team')
      .where('teamMember.memberId = :memberId', { memberId })
      .getMany();
  }

  async findWithTeamsByTeamId(teamId: number): Promise<TeamMember[]> {
    return await this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .leftJoinAndSelect('teamMember.team', 'team')
      .where('teamMember.teamId = :teamId', { teamId })
      .getMany();
  }

  async findOneByPrimaryKey(
    memberId: number,
    teamId: number,
  ): Promise<TeamMember | null> {
    return await this.teamMemberRepository.findOne({
      where: { memberId, teamId },
    });
  }

  async leaveTeam(teamId: number, memberId: number): Promise<boolean> {
    await this.teamMemberRepository.delete({ teamId, memberId });
    return true;
  }

  async softDeleteTeam(teamId: number) {
    // Team 엔티티 자체를 soft delete
    // DataSource의 쿼리 빌더를 사용하여 직접 Team 테이블에 접근
    await this.dataSource
      .createQueryBuilder()
      .update(Team)
      .set({ deletedAt: () => 'CURRENT_TIMESTAMP' })
      .where('id = :teamId', { teamId })
      .execute();
  }
}
