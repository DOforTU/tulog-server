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

  /**
   * create team
   */
  async createTeam(
    createTeamDto: CreateTeamDto,
    userId: number,
  ): Promise<Team> {
    // Check if team name already exists
    await this.existName(createTeamDto.name);

    // Check if user already has 3 teams
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

  async existName(name: string): Promise<boolean> {
    const existingTeam = await this.teamRepository.findByName(name);
    if (existingTeam) {
      throw new ConflictException('The team name already exist');
    }
    return !!existingTeam;
  }
}
