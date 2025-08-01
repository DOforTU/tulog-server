import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { TeamService } from './team.service';
import { TeamRepository } from './team.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Team])],
  providers: [TeamRepository, TeamService],
  exports: [TeamRepository], // 다른 모듈에서 필요하면 exports
})
export class TeamModule {}
