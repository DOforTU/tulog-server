import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto, PublicTeam, UpdateTeamInfoDto } from './team.dto';
import { User } from 'src/user/user.entity';
import { Team } from './team.entity';
import { SmartAuthGuard } from 'src/auth/jwt';

@Controller('teams')
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  @UseGuards(SmartAuthGuard)
  async createTeam(
    @Body() createTeamDto: CreateTeamDto,
    @Request() req: { user: User },
  ): Promise<Team> {
    return await this.teamService.createTeam(createTeamDto, req.user.id);
  }

  /**
   * get 요청시
   * 팀 아이디를 요청했을 때 팀 정보랑 속해있는 유저 정보 topublic 사용
   * 팀 아이디로 팀을 찾고 그 안에 맴버와 그 맴버 정보 가져옴
   */
  @Get(':id')
  async getTeamWithMembersById(
    @Param('id') id: number,
  ): Promise<PublicTeam | null> {
    return this.teamService.getTeamWithMembersById(id);
  }

  // 팀 이름으로 팀 정보만
  @Get('name/:name')
  async getTeamByName(@Param('name') name: string): Promise<Team | null> {
    return await this.teamService.getTeamByName(name);
  }

  @Patch(':id')
  @UseGuards(SmartAuthGuard)
  async updateTemaInfo(
    @Body() updateTeamInfoDto: UpdateTeamInfoDto,
    @Request() req: { user: User },
    @Param('id') id: number,
  ): Promise<Team> {
    return await this.teamService.updateTeamInfo(
      updateTeamInfoDto,
      req.user.id,
      id,
    );
  }

  @Delete(':id/leave')
  @UseGuards(SmartAuthGuard)
  async leaveTeam(
    @Param('id') id: number,
    @Request() req: { user: User },
  ): Promise<boolean> {
    return await this.teamService.leaveTeam(id, req.user.id);
  }
}
