import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Team } from './team.entity';
import { CreateTeamDto, UpdateTeamInfoDto } from './team.dto';
import { DataSource } from 'typeorm';
import {
  TeamMember,
  TeamMemberStatus,
} from 'src/team-member/team-member.entity';
import { TeamMemberService } from 'src/team-member/team-member.service';
import { TeamRepository } from './team.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamMemberService: TeamMemberService,
    private readonly teamRepository: TeamRepository,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
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
        mainImage: `${this.configService.get('TEAM_DEFAULT_IMAGE_URL')}`,
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

  /**
   * 팀이 존재하는지
   * 팀 이름 중복인지
   * 리더인지 아닌지
   *
   */
  async updateTeamInfo(
    updateTeamInfoDto: UpdateTeamInfoDto,
    userId: number,
    teamId: number,
  ): Promise<Team> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new NotFoundException("You can't not find the team.");
    }

    const teamMember = await this.teamMemberService.findTeamMemberByPrimaryKey(
      userId,
      teamId,
    );
    if (!teamMember || (teamMember && teamMember.isLeader == false)) {
      throw new BadRequestException(`You can not update teamId ${teamId}`);
    }

    const updatedTeam = await this.teamRepository.updateTeam(
      teamId,
      updateTeamInfoDto,
    );

    if (!updatedTeam) {
      throw new NotFoundException('Failed to update.');
    }
    return updatedTeam;
  }

  //---------------common function-------------------------------------
  async existName(name: string): Promise<boolean> {
    const existingTeam = await this.teamRepository.findByName(name);
    if (existingTeam) {
      throw new ConflictException('The team name already exist');
    }
    return !!existingTeam;
  }
}
