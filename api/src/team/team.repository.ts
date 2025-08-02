import { Injectable } from '@nestjs/common';
import { ChangeVisibilityDto, CreateTeamDto } from './team.dto';
import { Team } from './team.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull, Repository } from 'typeorm';

@Injectable()
export class TeamRepository {
  constructor(
    @InjectRepository(Team) private readonly teamRepository: Repository<Team>,
  ) {}

  // 팀 생성 로직
  async createTeam(teamDto: CreateTeamDto): Promise<boolean> {
    // 팀 생성 로직을 호출
    // 팀 생성 성공 여부를 반환
    const team = this.teamRepository.create(teamDto as DeepPartial<Team>);
    await this.teamRepository.save(team);
    return true;
  }

  // 팀 리스트 조회
  async findAllTeams(): Promise<Team[]> {
    // 팀 리스트 조회
    return await this.teamRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  // 팀 아이디로 상세 조회 로직
  async findTeamById(id: string): Promise<Team | null> {
    // 팀 아이디로 상세 조회 로직
    return await this.teamRepository.findOne({
      where: { teamId: id, deletedAt: IsNull() },
    });
  }

  // 팀 이름으로 상세 조회 로직
  async findTeamByName(name: string): Promise<Team | null> {
    return await this.teamRepository.findOne({
      where: { teamName: name, deletedAt: IsNull() },
    });
  }

  // 팀 이름 변경 로직
  async changeTeamName(newName: string): Promise<Team | null> {
    await this.teamRepository.update(newName, { teamName: newName });
    return await this.findTeamByName(newName);
  }

  // 팀 상태 설정 기능 로직
  async changeStatus(
    id: number,
    visibility: ChangeVisibilityDto,
  ): Promise<Team | null> {
    // 팀 생성 로직을 호출
    // 팀 생성 성공 여부를 반환
    await this.teamRepository.update(id, visibility);
    return await this.findTeamById(id.toString());
  }
}
