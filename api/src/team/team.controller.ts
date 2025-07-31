import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CreateTeamDto } from './team.dto';
import { TeamService } from './team.service';
import { Team } from './team.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';

@Controller('teams')
export class TeamController {
    constructor (private readonly teamService: TeamService) {}

    // 팀 생성 로직
    @Post()
        async createTeam (@Body() teamDto: CreateTeamDto): Promise<boolean> {
        // 팀 생성 로직을 호출
        // 팀 생성 성공 여부를 반환
        return await this.teamService.createTeam(teamDto);
        }

    // 팀 리스트 조회
    @Get()
        async findTems (): Promise<boolean> {
        // 팀 리스트 조회
        return await this.teamService.findTeams();
        }

    // 팀 아이디로 상세 조회 로직
    @Get(':id')
        async findTeamById (@Param('id', ParseIntPipe)): Promise<Team> {
        // 팀 아이디로 상세 조회 로직
        return await this.teamService.findTeamById(id);
        }

    // 팀 이름으로 상세 조회 로직
    @Get('name/:name')
        async findTeamByName (@Param('name') name: string): Promise<Team> {
        // 
        return await this.teamService.findTeamByName(name);
        }

    // 팀 신고 로직
    @Post(':id/report')
        @UseGuards(JwtAuthGuard)
        async reportTeam (@Param('id', ParseIntPipe) id: number, @Body() reportDto: any): Promise<boolean> {
        return await this.teamService.createTeam(teamDto);
        }
            // 팀 생성 로직
    @Post()
        async createTeam (@Body() teamDto: CreateTeamDto): Promise<boolean> {
        // 팀 생성 로직을 호출
        // 팀 생성 성공 여부를 반환
        return await this.teamService.createTeam(teamDto);
        }
}
