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

  // ===== UPDATE =====

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

  async findByPrimaryKey(
    teamId: number,
    memberId: number,
  ): Promise<TeamMember | null> {
    return await this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .where('teamMember.teamId = :teamId', { teamId })
      .andWhere('teamMember.memberId = :memberId', { memberId })
      .getOne();
  }

  /**
   * 팀장 권한 위임
   * 팀장인지 확인하고
   * 해당 팀에 있는 팀원에게 팀장 권한을 넘겨줌
   * 그리고 그 팀장은 일반 팀원으로 변경
   * 팀장이 변경되었다고 알림을 (팀 전체에게 공지 혹은 변경된 팀장에게만)
   *
   */
  async findTeamLeaderById(
    teamId: number,
    leaderId: number,
  ): Promise<TeamMember | null> {
    const teamLeader = await this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .leftJoinAndSelect('teamMember.team', 'team')
      .where('teamMember.memberId = :leaderId', { leaderId })
      .andWhere('teamMember.teamId = teamId', { teamId })
      .andWhere('teamMember.isLeader = :isLeader', { isLeader: true })
      .getOne();
    return teamLeader;
  }

  // 해당 리더 위임 받을 팀원 한명만 가져오기

  async findMemberById(
    memberId: number,
    teamId: number,
  ): Promise<TeamMember | null> {
    const member = await this.teamMemberRepository
      .createQueryBuilder('teamMember')
      .leftJoinAndSelect('teamMember.team', 'team')
      .where('teamMember.memberId = :memberId', { memberId })
      .andWhere('teamMember.teamId = :teamId', { teamId })
      .getOne();
    return member;
  }
}
