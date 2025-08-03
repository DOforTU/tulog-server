import { Controller, Get, UseGuards } from '@nestjs/common';
import { TeammemberService } from './teammember.service';
import { SmartAuthGuard } from 'src/auth/jwt';
import { TeamController } from 'src/team/team.controller';

@Controller('team-member')
export class TeammemberController {
  constructor(
    private readonly teammemberSrvice: TeammemberService,
    private readonly teamController: TeamController,
  ) {}

  @Get('team-member')
  @UseGuards(SmartAuthGuard)
  async findTeammeber() {}
}
