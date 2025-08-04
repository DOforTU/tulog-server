import { Module } from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { TeamMemberController } from './team-member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from './team-member.entity';
import { TeamMemberRepository } from './team-member.repository';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember])],
  providers: [TeamMemberService, TeamMemberRepository],
  controllers: [TeamMemberController],
  exports: [TeamMemberService, TeamMemberRepository],
})
export class TeamMemberModule {}
