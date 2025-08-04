import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto, UpdateTeamInfoDto } from './team.dto';
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

  @Patch(':id')
  @UseGuards(SmartAuthGuard)
  async updateTemaInfo(
    @Body() updateTeamInfoDto: UpdateTeamInfoDto,
    @Param('id') id: number,
    @Request() req: { user: User },
  ): Promise<Team> {
    return await this.teamService.updateTemaInfo(
      updateTeamInfoDto,
      id,
      req.user,
    );
  }
}
