import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ChangeVisibilityDto, CreateTeamDto } from './team.dto';
import { Team, TeamVisibility } from './team.entity';
import { TeamRepository } from './team.repository';
import { UserService } from 'src/user/user.service';
import { User } from 'src/user/user.entity';
import { NotFoundError } from 'rxjs';
import { Teammember } from 'src/teammember/teammember.entity';
import { TeammemberService } from 'src/teammember/teammember.service';
import { TeammemberRepository } from 'src/teammember/teamember.repository';

@Injectable()
export class TeamService {
  constructor(
    private readonly teamRepository: TeamRepository,
    private readonly teammemberRepository: TeammemberRepository,
    private readonly teamemberService: TeammemberService,
  ) {}

  /** Create a Team
   * 이름과 리더(ID)가 존재하는지
   * 예외처리 - 팀 이름 중복
   * 예외처리 - 팀장 중복 (이게 팀장은 즉 사용자는 3개의 팀을 구성할 수 있음)
   * 예외처리 - 팀 이름 길이 제한 (dto에서 이름을 미리 제한 시킴)
   *
   */
  async createTeam(teamDto: CreateTeamDto, user: User): Promise<Team> {
    const leaderId = user.id;

    if (!teamDto.teamName) {
      throw new Error('Team name is required');
    }

    const existingTeam = await this.teamRepository.findTeamByName(
      teamDto.teamName,
    );
    if (existingTeam) {
      throw new ConflictException('The team name already exist.');
    }

    const leaderTeamsCount =
      await this.teamemberService.countTeamsByLeaderId(leaderId);

    if (leaderTeamsCount >= 3) {
      throw new ConflictException(
        '한 사용자는 최대 3개의 팀만 생성할 수 있습니다.',
      );
    }
    const team = await this.teamRepository.createTeam(teamDto, user);
    await this.teamemberService.addTeamMember(user.id, team.teamId, 'leader');

    return team;
  }

  /**  팀 리스트 조회
   * 로그인한 유저인지 확인
   * 팀은 초대 상태만 있음
   */
  async findAllTeams(user: User): Promise<Team[]> {
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }
    return await this.teamRepository.findAllTeams();
  }

  /**팀 아이디로 상세 조회 로직
   * 로그인한 유저인지 확인
   * 조회하려는 팀 아이디가 유효한지 확인
   * 공개 비공개인지 여부 확인
   */
  async findTeamById(id: number, user: User): Promise<Team | null> {
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const team = await this.teamRepository.findTeamById(id);
    if (!team) {
      throw new NotFoundException('Can not found that team.');
    }
    return await this.teamRepository.findTeamById(id);
  }

  /**팀 이름으로 상세 조회 로직
   * 로그인한 유저인지 확인
   * 조회하려는 팀 이름이 유효한지 확인
   * 공개 비공개인지 여부 확인 (아 공개는 없고 초대상태인데 이거는 상의해봐야겠네)
   */
  async findTeamByName(name: string, user: User): Promise<Team | null> {
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const team = await this.teamRepository.findTeamByName(name);
    if (!team) {
      throw new NotFoundException('Can not found that team.');
    }
    return await this.teamRepository.findTeamByName(name);
  }

  /**팀 이름 변경 로직
   * 로그인한 유저인지
   * 팀이 존재하는지
   * 팀장인지 확인 (팀장만 팀 이름 변경 가능)
   * 팀 이름이 중복인지 확인
   *
   */
  async changeTeamName(
    user: User,
    oldName: string,
    newName: string,
  ): Promise<Team | null> {
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const team = await this.teamRepository.findTeamByName(oldName);
    if (!team) {
      throw new NotFoundException('Can not found that team.');
    }

    if (team.leaderId !== user.id) {
      throw new ForbiddenException(
        'Only team leader can change the team name.',
      );
    }

    const exsitingTeamName = await this.teamRepository.findTeamByName(newName);
    if (exsitingTeamName) {
      throw new ConflictException('The team name already exists.');
    }
    return await this.teamRepository.changeTeamName(oldName, newName);
  }

  // 팀 상태 설정 기능 로직
  async changeStatus(
    user: User,
    id: number,
    visibility: ChangeVisibilityDto,
  ): Promise<Team | null> {
    if (!user) {
      throw new UnauthorizedException('Authentication required.');
    }

    const team = await this.teamRepository.findTeamById(id);
    if (!team) {
      throw new NotFoundException('Can not found that team.');
    }

    if (team.leaderId !== user.id) {
      throw new ForbiddenException(
        'Only team leader can change the team status.',
      );
    }
    return await this.teamRepository.changeStatus(id, visibility);
  }
}
