import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ChangeVisibilityDto, CreateTeamDto } from './team.dto';
import { TeamService } from './team.service';
import { Team, TeamVisibility } from './team.entity';
import { JwtAuthGuard } from 'src/auth/jwt/jwt-auth.guard';
import { SmartAuthGuard } from 'src/auth/jwt';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // 팀 생성 로직
  @Post()
  @UseGuards(SmartAuthGuard)
  async createTeam(@Body() teamDto: CreateTeamDto): Promise<boolean> {
    // 팀 생성 로직을 호출
    // 팀 생성 성공 여부를 반환
    return await this.teamService.createTeam(teamDto);
  }

  // 팀 리스트 조회
  @Get()
  // 조회도 로그인한 사용자만 가능인가?
  async findTeams(): Promise<Team[]> {
    // 팀 리스트 조회
    return await this.teamService.findAllTeams();
  }

  // 팀 아이디로 상세 조회 로직
  @Get(':id')
  @UseGuards(SmartAuthGuard)
  async findTeamById(
    @Param('id', ParseIntPipe) id: string,
  ): Promise<Team | null> {
    // 팀 아이디로 상세 조회 로직
    return await this.teamService.findTeamById(id);
  }

  // 팀 이름으로 상세 조회 로직
  @Get('name/:name')
  @UseGuards(SmartAuthGuard)
  async findTeamByName(@Param('name') name: string): Promise<Team | null> {
    //
    return await this.teamService.findTeamByName(name);
  }

  // 팀 이름 변경 로직
  @Patch(':name')
  @UseGuards(SmartAuthGuard)
  async changeTeamName(
    @Param('name') name: string,
    @Body('newName') newName: string,
  ): Promise<Team | null> {
    return await this.teamService.changeTeamName(name, newName);
  }

  // 팀 상태 설정 기능 로직
  @Post(':id/visibility')
  @UseGuards(SmartAuthGuard)
  async changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() visibility: ChangeVisibilityDto,
  ): Promise<Team | null> {
    // 팀 생성 로직을 호출
    // 팀 생성 성공 여부를 반환
    return await this.teamService.changeStatus(id, visibility);
  }
}
