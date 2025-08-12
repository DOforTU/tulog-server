import { Module } from '@nestjs/common';
import { TeamFollow } from './team-follow.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamFollowService } from './team-follow.service';
import { TeamFollowRepository } from './team-follow.repository';
import { TeamFollwController } from './team-follow.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TeamFollow]), TeamFollowModule],
  providers: [TeamFollowService, TeamFollowRepository],
  exports: [TeamFollowService, TeamFollowRepository],
  controllers: [TeamFollwController],
})
export class TeamFollowModule {}
