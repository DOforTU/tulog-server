import { Module } from '@nestjs/common';
import { TeamFollow } from './team-follow.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamFollowService } from './team-follow.service';
import { TeamFollowRepository } from './team-follow.repository';
import { TeamFollwController } from './team-follow.controller';
import { UserModule } from 'src/user/user.module';
import { TeamModule } from 'src/team/team.module';
import { TeamMemberModule } from 'src/team-member/team-member.module';
import { NoticeModule } from 'src/notice/notice.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TeamFollow]),
    TeamFollowModule,
    UserModule,
    TeamModule,
    TeamMemberModule,
    NoticeModule,
  ],
  providers: [TeamFollowService, TeamFollowRepository],
  exports: [TeamFollowService, TeamFollowRepository],
  controllers: [TeamFollwController],
})
export class TeamFollowModule {}
