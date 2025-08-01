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
    async findTeams(): Promise<Team[]> {
        // 팀 리스트 조회
        return await this.teamRepository.findTeams();
    }

    // 팀 아이디로 상세 조회 로직
    async findTeamById(id: string): Promise<Team | null> {
        // 팀 아이디로 상세 조회 로직
        return await this.teamRepository.findTeamById(id);
    }

    // 팀 이름으로 상세 조회 로직
    async findTeamByName(name: string): Promise<Team | null> {
        return await this.teamRepository.findTeamByName(name);
    }

    // 팀 이름 변경 로직
    async changeTeamName(name: string, newName: string): Promise<Team | null> {
        return await this.teamRepository.changeTeamName(newName);
    }

    // 팀 상태 설정 기능 로직
    async changeStatus(id: number, visibility: ChangeVisibilityDto ): Promise<Team | null> {
        // 팀 생성 로직을 호출
        // 팀 생성 성공 여부를 반환
        return await this.teamRepository.changeStatus(id, visibility);
    }
}
