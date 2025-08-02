import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChangeVisibilityDto, CreateTeamDto } from './team.dto';
import { TeamService } from './team.service';
import { Team } from './team.entity';
import { SmartAuthGuard } from 'src/auth/jwt';
import { User } from 'src/user/user.entity';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  // 팀 생성 로직
  @Post()
  @UseGuards(SmartAuthGuard)
  async createTeam(
    @Body() teamDto: CreateTeamDto,
    @Request() req: { user: User },
  ): Promise<Team> {
    // 팀 생성 로직을 호출
    // 팀 생성 성공 여부를 반환
    return await this.teamService.createTeam(teamDto, req.user);
  }

  // 팀 리스트 조회
  @Get()
  // 조회도 로그인한 사용자만 가능인가?
  async findTeams(@Request() req: { user: User }): Promise<Team[]> {
    // 팀 리스트 조회
    return await this.teamService.findAllTeams(req.user);
  }

  // 팀 아이디로 상세 조회 로직
  @Get(':id')
  @UseGuards(SmartAuthGuard)
  async findTeamById(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: User },
  ): Promise<Team | null> {
    // 팀 아이디로 상세 조회 로직
    return await this.teamService.findTeamById(id, req.user);
  }

  // 팀 이름으로 상세 조회 로직
  @Get('name/:name')
  @UseGuards(SmartAuthGuard)
  async findTeamByName(
    @Param('name') name: string,
    @Request() req: { user: User },
  ): Promise<Team | null> {
    return await this.teamService.findTeamByName(name, req.user);
  }

  // 팀 이름 변경 로직
  @Patch(':name')
  @UseGuards(SmartAuthGuard)
  async changeTeamName(
    @Request() req: { user: User },
    @Param('name') oldName: string,
    @Body('newName') newName: string,
  ): Promise<Team | null> {
    return await this.teamService.changeTeamName(req.user, oldName, newName);
  }

  // 팀 상태 설정 기능 로직
  @Post(':id/visibility')
  @UseGuards(SmartAuthGuard)
  async changeStatus(
    @Request() req: { user: User },
    @Param('id', ParseIntPipe) id: number,
    @Body() visibility: ChangeVisibilityDto,
  ): Promise<Team | null> {
    // 팀 생성 로직을 호출
    // 팀 생성 성공 여부를 반환
    return await this.teamService.changeStatus(req.user, id, visibility);
  }
}
