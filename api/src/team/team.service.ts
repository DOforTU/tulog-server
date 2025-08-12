import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Team } from './team.entity';
import { CreateTeamDto, PublicTeam, UpdateTeamInfoDto } from './team.dto';
import { DataSource } from 'typeorm';
import {
  TeamMember,
  TeamMemberStatus,
} from 'src/team-member/team-member.entity';
import { TeamMemberService } from 'src/team-member/team-member.service';
import { TeamRepository } from './team.repository';
import { ConfigService } from '@nestjs/config';
import { toPublicUsers } from 'src/common/helper/to-public-user';
import { User } from 'src/user/user.entity';
import { PublicUser } from 'src/user/user.dto';

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

  // ===== Get team info Methods =====
  /**
   * 팀을 가져오고 속해있는 맴버 정보 가져옴
   */
  async getTeamWithMembersById(id: number): Promise<PublicTeam> {
    const teamWithMembers =
      await this.teamRepository.findTeamWithMembersById(id);

    if (!teamWithMembers) {
      throw new NotFoundException('You can not found this team');
    }

    // 팀멤버의 유저만 추출
    const users: User[] = teamWithMembers.teamMembers.map((tm) => tm.user); // tm은 팀 맴버를 말하고 그 안에 user를 추출
    const publicUsers: PublicUser[] = toPublicUsers(users); // 추출한 user정보를 pulic화해서 다시 선언

    const updatedTeamMembers = teamWithMembers.teamMembers.map(
      (member, index) => ({
        ...member,
        user: publicUsers[index],
      }),
    );

    return {
      ...teamWithMembers, // Team 전체를 말하는거고
      teamMembers: updatedTeamMembers, // teamMembers안에 유저만 public으로 덮어 씌워서 객체로 반환
    };
  }

  async getTeamWithMembersByName(name: string): Promise<PublicTeam> {
    const teamWithMembers =
      await this.teamRepository.findTeamWithMembersByName(name);

    if (!teamWithMembers) {
      throw new NotFoundException('You can not found this team');
    }

    // 팀멤버의 유저만 추출
    const users: User[] = teamWithMembers.teamMembers.map((tm) => tm.user); // tm은 팀 맴버를 말하고 그 안에 user를 추출
    const publicUsers: PublicUser[] = toPublicUsers(users); // 추출한 user정보를 pulic화해서 다시 선언

    const updatedTeamMembers = teamWithMembers.teamMembers.map(
      (member, index) => ({
        ...member,
        user: publicUsers[index],
      }),
    );

    return {
      ...teamWithMembers, // Team 전체를 말하는거고
      teamMembers: updatedTeamMembers, // teamMembers안에 유저만 public으로 덮어 씌워서 객체로 반환
    };
  }

  async getTeamById(id: number): Promise<Team> {
    const team = await this.teamRepository.findById(id);
    if (!team) {
      throw new NotFoundException('You can not found this team');
    }
    return team;
  }

  /**
   *
   * @param teamId 팀을 팔로우한 유저를 조회
   */
  async findFollowingUserById(teamId: number): Promise<Team | null> {
    const user = await this.teamRepository.findFollowingUserById(teamId);
    return user;
  }

  //---------------Update function-------------------------------------
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

  async leaveTeam(teamId: number, memberId: number): Promise<boolean> {
    return await this.teamMemberService.leaveTeam(teamId, memberId);
  }
}
