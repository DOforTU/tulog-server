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
    //await this.teamMemberRepository.softDelete(teamId); 이렇게 작성했는데 맞나? teamId를 기준으로 해당 팀을 삭제
    // 아래와 같이 쿼리 빌더 사용 -> 근데 우리가 데이터 베이스에서 팀을 softdelete해서 정보는 남겨둔다고 해서 teammember가 해당 teamId에 속한 정보 다 삭제
    await this.teamMemberRepository
      .createQueryBuilder()
      .softDelete()
      .where('teamId = :teamId', { teamId })
      .execute();
  }
}
