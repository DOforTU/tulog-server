import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { TeamService } from './team.service';
import { TeamController } from './team.controller';
import { TeamMemberModule } from 'src/team-member/team-member.module';
import { TeamRepository } from './team.repository';
import { TeamFollowModule } from 'src/team-follow/team-follow.module';

@Module({
  imports: [TypeOrmModule.forFeature([Team]), TeamMemberModule],
  providers: [TeamService, TeamRepository],
  exports: [TeamService, TeamRepository],
  controllers: [TeamController],
})
export class TeamModule {}
