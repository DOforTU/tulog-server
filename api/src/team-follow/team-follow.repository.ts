import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TeamFollow } from './team-follow.entity';

@Injectable()
export class TeamFollowRepository {
  constructor(
    @InjectRepository(TeamFollow)
    private readonly teamFollowRepository: Repository<TeamFollow>,
  ) {}

  // ===== CREATE =====

  /** Follow a team */
  async followTeam(userId: number, teamId: number): Promise<TeamFollow> {
    const followTeam = this.teamFollowRepository.create({ userId, teamId });
    return await this.teamFollowRepository.save(followTeam);
  }

  // ===== READ =====

  /**
   * 팀 아이디로 팀 맴버를 가져온다 --> 사용자는 팔로우한 팀 맴버를 조회할 수 있다.
   *
   */
  async getTeamMembersByTeamId(teamId: number): Promise<TeamFollow[]> {
    return this.teamFollowRepository
      .createQueryBuilder('teamMember')
      .leftJoinAndSelect('teamMember.team', 'team')
      .leftJoinAndSelect('teamMember.user', 'user')
      .where('teamMember.teamId = :teamId', { teamId })
      .getMany();
  }

  // ===== DELETE =====
  /** Unfollow a team */
  async unfollowTeam(userId: number, teamId: number): Promise<boolean> {
    await this.teamFollowRepository.delete({ userId, teamId });
    return true;
  }

  // ===== SUB FUNCTION =====
  /** check if the duplicate follow exists */
  async isFollowing(userId: number, teamId: number): Promise<boolean> {
    const isFollowing = await this.teamFollowRepository.findOne({
      where: { userId, teamId },
    });
    return isFollowing !== null;
  }
}
