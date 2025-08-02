import { Injectable } from '@nestjs/common';
import { ChangeVisibilityDto, CreateTeamDto } from './team.dto';
import { Team } from './team.entity';
import { TeamRepository } from './team.repository';
import { UserService } from 'src/user/user.service';

@Injectable()
export class TeamService {
    constructor(
        private readonly teamRepository: TeamRepository,
        private readonly userservice: UserService,
    ) {}

    /** Create a Team
     * 예외처리 - 팀 이름 중복
     * 예외처리 - 팀장 중복
     * 예외처리 - 팀 이름 길이 제한
     * 예외처리 - 팀장 길이 제한
     */ 
    async createTeam(teamDto: CreateTeamDto): Promise<boolean> {
        if(!teamDto.teamName || !teamDto.leaderId) {
            throw new Error('Team name and leader ID are required');  
    }
    return await this.teamRepository.createTeam(teamDto);
}

  // 팀 리스트 조회
  async findAllTeams(): Promise<Team[]> {
    /**
     * 로그인한 유저인지 확인
     * 상태가 공개인 상태만 조회가 가능 (아니면 비공개도 조회는 가능하게할까 )
     */
    return await this.teamRepository.findAllTeams();
  }

  // 팀 아이디로 상세 조회 로직
  async findTeamById(id: string): Promise<Team | null> {
    /**
     * 로그인한 유저인지 확인
     * 조회하려는 팀 아이디가 유효한지 확인
     * 공개 비공개인지 여부 확인
     */
    return await this.teamRepository.findTeamById(id);
  }

  // 팀 이름으로 상세 조회 로직
  async findTeamByName(name: string): Promise<Team | null> {
    /**
     * 로그인한 유저인지 확인
     * 조회하려는 팀 이름이 유효한지 확인
     * 공개 비공개인지 여부 확인 (아 공개는 없고 초대상태인데 이거는 상의해봐야겠네)
     */
    return await this.teamRepository.findTeamByName(name);
  }

  // 팀 이름 변경 로직
  async changeTeamName(name: string, newName: string): Promise<Team | null> {
    /**
     * 로그인한 유저인지
     * 팀장인지 확인 (팀장만 팀 이름 변경 가능)
     * 팀 이름이 중복인지 확인
     *
     */
    return await this.teamRepository.changeTeamName(newName);
  }

  // 팀 상태 설정 기능 로직
  async changeStatus(
    id: number,
    visibility: ChangeVisibilityDto,
  ): Promise<Team | null> {
    // 팀 생성 로직을 호출
    // 팀 생성 성공 여부를 반환
    return await this.teamRepository.changeStatus(id, visibility);
  }
}
