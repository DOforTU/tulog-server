import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Team } from './team.entity';
import { CreateTeamDto } from './team.dto';
import { DataSource } from 'typeorm';
import {
  TeamMember,
  TeamMemberStatus,
} from 'src/team-member/team-member.entity';
import { TeamMemberService } from 'src/team-member/team-member.service';
import { TeamRepository } from './team.repository';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamMemberService: TeamMemberService,
    private readonly teamRepository: TeamRepository,
    private readonly dataSource: DataSource,
  ) {}
  async createTeam(
    createTeamDto: CreateTeamDto,
    userId: number,
  ): Promise<Team> {
    /**
     * dto에 팀 이름이 존재하는지
     * 사용자가 속해있는 팀이 3개 이상인지
     * 팀 멤버 스테이터스가 join것만 필터링
     * 3개 미만이면 팀 생성
     */
    const existingTeamName = await this.teamRepository.findByTeamName(
      createTeamDto.name,
    );
    if (existingTeamName) {
      throw new ConflictException('The team name already exist');
    }

    const countExistingTeams =
      await this.teamMemberService.countTeamsByMemberId(userId);
    if (countExistingTeams >= 3) {
      throw new ConflictException('You already join over 3 teams');
    }

    // Create team
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // create new user with isActive: false (default)
      const createdTeam = await queryRunner.manager.save(Team, {
        name: createTeamDto.name,
        inroduction: createTeamDto.introduction,
        visibility: createTeamDto.visibility,
        maxMember: createTeamDto.maxMember,
      });

      // create auth record
      await queryRunner.manager.save(TeamMember, {
        memberId: userId,
        team: createdTeam,
        teamMemberStatus: TeamMemberStatus.JOINED,
        isLeader: true,
      });

      // commit transaction
      await queryRunner.commitTransaction();

      // 회원가입 성공 시 email만 반환
      return createdTeam;
    } catch (error: any) {
      console.error('create team error:', error);
      // if error occurs, rollback transaction
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException('Failed creating team');
    } finally {
      // release(): return connection to pool
      await queryRunner.release();
    }
  }
}
