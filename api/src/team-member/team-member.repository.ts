import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { TeamMember, TeamMemberStatus } from './team-member.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TeamMemberRepository {
  constructor(
    @InjectRepository(TeamMember)
    private readonly teamMemberRepository: Repository<TeamMember>,
  ) {}

  // ===== CREATE =====

  async inviteTeam(teamId: number, memberId: number): Promise<TeamMember> {
    const teamMember = this.teamMemberRepository.create({
      teamId,
      memberId,
      status: TeamMemberStatus.INVITED,
    });
    return await this.teamMemberRepository.save(teamMember);
  }

  async requestToTeam(teamId: number, memberId: number): Promise<TeamMember> {
    const teamMember = this.teamMemberRepository.create({
      teamId,
      memberId,
      status: TeamMemberStatus.PENDING,
    });
    return await this.teamMemberRepository.save(teamMember);
  }

  // ===== READ =====

  /**
   * 팀 아이디로 팀 맴버를 가져온다 --> 팀 맴버로 역 조회를 하기 위함
   *
   */
  async getTeamMembersByTeamId(teamId: number): Promise<TeamMember[]> {
    return this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .leftJoinAndSelect('teamMember.team', 'team')
      .leftJoinAndSelect('teamMember.user', 'user')
      .where('teamMember.teamId = :teamId', { teamId })
      .getMany();
  }

  // ===== DLELETE =====

  async leaveTeam(teamId: number, memberId: number): Promise<boolean> {
    await this.teamMemberRepository.delete({ teamId, memberId });
    return true;
  }

  // ===== SUB FUNCTION =====

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
      .andWhere('teamMember.status = :status', {
        status: TeamMemberStatus.JOINED,
      })
      .getMany();
  }

  async findOneByPrimaryKey(
    teamId: number,
    memberId: number,
  ): Promise<TeamMember | null> {
    return await this.teamMemberRepository.findOne({
      where: { teamId, memberId },
    });
  }


}
