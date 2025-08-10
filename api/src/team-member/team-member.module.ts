import { Module } from '@nestjs/common';
import { TeamMemberService } from './team-member.service';
import { TeamMemberController } from './team-member.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamMember } from './team-member.entity';
import { TeamMemberRepository } from './team-member.repository';
import { UserModule } from 'src/user/user.module';
import { NoticeModule } from 'src/notice/notice.module';

@Module({
  imports: [TypeOrmModule.forFeature([TeamMember]), UserModule, NoticeModule],
  providers: [TeamMemberService, TeamMemberRepository],
  controllers: [TeamMemberController],
  exports: [TeamMemberService, TeamMemberRepository],
})
export class TeamMemberModule {}
